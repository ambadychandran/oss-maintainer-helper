import axios, { AxiosInstance } from 'axios';
import Redis from 'ioredis';

export class GitHubRetriever {
  private axios: AxiosInstance;
  private redis?: Redis;

  constructor(token?: string, redisUrl?: string) {
    this.axios = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
  }

  private handleAxiosError(error: unknown): never {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new Error('Unauthorized: Invalid GitHub token');
      }
      if (status === 403) {
        throw new Error('Forbidden: API rate limit exceeded or access denied');
      }
      if (status === 404) {
        throw new Error('Not Found: Repository or resource does not exist');
      }
      throw new Error(`GitHub API Error: ${status}`);
    }
    throw error instanceof Error ? error : new Error('Unknown error');
  }

  private async fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.redis) {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    }

    try {
      const result = await fetcher();
      if (this.redis) {
        await this.redis.set(key, JSON.stringify(result), 'EX', 3600);
      }
      return result;
    } catch (err) {
      this.handleAxiosError(err);
    }
  }

  async getReadme(repoFullName: string): Promise<string> {
    const key = `readme:${repoFullName}`;
    const content = await this.fetchWithCache(key, async () => {
      const res = await this.axios.get(`/repos/${repoFullName}/readme`);
      return Buffer.from(res.data.content, 'base64').toString('utf-8');
    });
    return content;
  }

  async getIssues(repoFullName: string): Promise<object[]> {
    const key = `issues:${repoFullName}`;
    const issues = await this.fetchWithCache(key, async () => {
      const res = await this.axios.get(`/repos/${repoFullName}/issues`, {
        params: { state: 'open' },
      });
      return res.data as object[];
    });
    return issues;
  }

  async getPullRequests(repoFullName: string): Promise<object[]> {
    const key = `pulls:${repoFullName}`;
    const pulls = await this.fetchWithCache(key, async () => {
      const res = await this.axios.get(`/repos/${repoFullName}/pulls`, {
        params: { state: 'open' },
      });
      return res.data as object[];
    });
    return pulls;
  }
}
