# OSS Maintainer Helper

A fully open-source, agentic RAG app for GitHub maintainers** that uses **LangGraph**, **Chroma**, **PostgreSQL**, and **Redis** to help fetch, summarise, and analyse repository data.
## 📌 Table of Contents

1. [Features](#-features)  
2. [Tech Stack](#-tech-stack)  
3. [Prerequisites](#-prerequisites)  
4. [Getting Started (Docker)](#-getting-started-docker)  
5. [Testing Each Service](#-testing-each-service)  
6. [Local Development](#-local-development)  
7. [Troubleshooting](#-troubleshooting)  
8. [Contributing](#-contributing)  

## ✅ Features

✔ Fetches and indexes GitHub repo READMEs  
✔ Summarises repository details using LLM (LangGraph)  
✔ Logs metadata into Postgres  
✔ Caches responses with Redis  
✔ Simple Next.js frontend for maintainers  

## 🏗 Tech Stack

| Component        | Purpose                               |
|-------------------|---------------------------------------|
| **LangGraph**     | AI state machine for orchestrating tasks |
| **Chroma**        | Vector database for embedding search   |
| **PostgreSQL**    | Persistent metadata storage            |
| **Redis**         | Cache for intermediate results         |
| **Next.js**       | Frontend UI dashboard                  |
| **Nx Monorepo**   | Project management & task runner       |
| **Docker Compose**| Multi-service orchestration            |

## 🔧 Prerequisites

- **Docker & Docker Compose**  
- **pnpm** (`corepack enable` or install manually)  
- **4GB RAM minimum** (8GB recommended, especially on Raspberry Pi)

## 🚀 Getting Started (Docker)

### 1. Clone & Build

```bash
git clone https://github.com/<your-org>/oss-maintainer-helper.git
cd oss-maintainer-helper
docker compose up --build
```

✔ Services started:

| Service      | Port               | Description                             |
|--------------|--------------------|-----------------------------------------|
| **Frontend** | [http://localhost:3000](http://localhost:3000) | Next.js UI                               |
| **Gateway**  | [http://localhost:4000/api](http://localhost:4000/api) | REST API gateway                         |
| **Agent**    | [http://localhost:8001](http://localhost:8001) | LangGraph-powered AI agent               |
| **Chroma**   | [http://localhost:8000](http://localhost:8000) | Vector database                          |
| **Postgres** | `localhost:5432`   | Database                                 |
| **Redis**    | `localhost:6379`   | Cache store                              |

To stop everything:

```bash
docker compose down -v
```

## 🧪 Testing Each Service

### ✅ 1. Agent (LangGraph)

Check health:

```bash
curl http://localhost:8001/health
```

Run a query:

```bash
curl -X POST http://localhost:8001/query   -H "Content-Type: application/json"   -d '{"question": "What does this repo do?", "repo": "openai/langchain"}'
```

Expected output:

```json
{
  "answer": "Summary for What does this repo do?",
  "steps": ["retrieving", "planning", "summarising", "logging"]
}
```

### ✅ 2. Gateway

```bash
curl http://localhost:4000/api/health
```

### ✅ 3. Frontend

Open in browser: `http://localhost:3000`

### ✅ 4. Chroma

```bash
curl http://localhost:8000/api/v1/heartbeat
```

### ✅ 5. Postgres

```bash
docker exec -it oss-maintainer-helper-postgres-1 psql -U postgres
\l
\q
```

### ✅ 6. Redis

```bash
docker exec -it oss-maintainer-helper-redis-1 redis-cli ping
```

## 🛠 Local Development

Run services individually:

### Run Agent

```bash
pnpm install
pnpm nx serve @oss-maintainer-helper/agent
```

### Run Frontend

```bash
pnpm nx dev @oss-maintainer-helper/frontend
```

## ⚠️ Troubleshooting

- **Connection reset by peer** → Ensure the agent service is running: `docker logs oss-maintainer-helper-agent-1`
- **Redis Warning** → `sudo sysctl vm.overcommit_memory=1`
- **pnpm Download Issues** → `corepack prepare pnpm@latest --activate`
- **Clean volumes** → `docker compose down -v && docker compose up --build`

## 🤝 Contributing

1. Fork & create a feature branch  
2. Run lint & tests before committing:

```bash
pnpm lint
pnpm test
```

3. Submit a PR

## 📌 Roadmap

- ✅ GitHub Issues & PRs Retriever  
- ✅ RAG-based summaries  
- ⬜ AI-based PR review suggestions  
- ⬜ Multi-repo maintenance dashboard
