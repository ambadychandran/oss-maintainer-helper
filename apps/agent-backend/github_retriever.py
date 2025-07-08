import base64
import json
from typing import Optional, List, Dict

import requests
try:
    import redis
except ImportError:  # pragma: no cover
    redis = None


class GitHubRetriever:
    """Simple helper to fetch GitHub repo data with optional caching."""

    def __init__(self, token: Optional[str] = None, redis_url: Optional[str] = None):
        self.session = requests.Session()
        if token:
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        self.session.headers.update({"Accept": "application/vnd.github+json"})

        self.redis = None
        if redis_url and redis is not None:
            try:
                self.redis = redis.Redis.from_url(redis_url)
            except redis.RedisError:
                self.redis = None
        self.ttl = 3600

    # Internal helpers -------------------------------------------------
    def _cache_get(self, key: str):
        if self.redis:
            try:
                val = self.redis.get(key)
                if val:
                    return json.loads(val)
            except redis.RedisError:
                pass
        return None

    def _cache_set(self, key: str, value):
        if self.redis:
            try:
                self.redis.setex(key, self.ttl, json.dumps(value))
            except redis.RedisError:
                pass

    def _request(self, url: str):
        resp = self.session.get(url)
        if resp.status_code == 401:
            raise RuntimeError("Unauthorized (401)")
        if resp.status_code == 403:
            raise RuntimeError("Forbidden or rate limited (403)")
        if resp.status_code == 404:
            raise RuntimeError("Not found (404)")
        resp.raise_for_status()
        return resp.json()

    # Public API -------------------------------------------------------
    def get_readme(self, repo_full_name: str) -> str:
        key = f"readme:{repo_full_name}"
        cached = self._cache_get(key)
        if cached is not None:
            return cached
        url = f"https://api.github.com/repos/{repo_full_name}/readme"
        data = self._request(url)
        content_encoded = data.get("content", "")
        text = base64.b64decode(content_encoded).decode("utf-8") if content_encoded else ""
        self._cache_set(key, text)
        return text

    def get_issues(self, repo_full_name: str) -> List[Dict]:
        key = f"issues:{repo_full_name}"
        cached = self._cache_get(key)
        if cached is not None:
            return cached
        url = f"https://api.github.com/repos/{repo_full_name}/issues?state=open&per_page=100"
        data = self._request(url)
        self._cache_set(key, data)
        return data

    def get_pull_requests(self, repo_full_name: str) -> List[Dict]:
        key = f"pulls:{repo_full_name}"
        cached = self._cache_get(key)
        if cached is not None:
            return cached
        url = f"https://api.github.com/repos/{repo_full_name}/pulls?state=open&per_page=100"
        data = self._request(url)
        self._cache_set(key, data)
        return data
