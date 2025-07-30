# OSS Maintainer Helper

A fully open-source, agentic RAG app for GitHub maintainers that uses **LangGraph**, **LangChain**, **Chroma**, **PostgreSQL**, and **Redis** to help fetch, summarise, and analyse repository data.


## 📌 Table of Contents

1. [Summary](#-summary)
3. [Features](#-features)
4. [High-Level Architecture](#-high-level-architecture)    
5. [Tech Stack](#-tech-stack)  
6. [Folder Structure](#-folder-structure)
7. [Agent Nodes](#-agent-nodes)
8. [Prerequisites](#-prerequisites)  
9. [Getting Started (Docker)](#-getting-started-docker)  
10. [Testing Each Service](#-testing-each-service)  
11. [Local Development](#-local-development)  
12. [Troubleshooting](#-troubleshooting)  


## 📌 Summary

OSS Maintainer Helper is a fully open-source, agentic RAG application that allows developers to interact with and analyse GitHub repositories using **LLMs**, **retrieval**, and **tool integrations**.

This app runs entirely locally using **Docker** and includes a monorepo setup powered by **Nx**, allowing seamless coordination of:

- **Frontend**: Next.js 
- **Backend**: Express.js (API Gateway)  
- **Agent Backend**: Express.js + LangGraph.js + LangChain.js

It provides **efficient build management**, **RAG-based summarisation**, and  **MCP (Model Context Protocol)** tool integration for enhanced interoperability.


## 🚀 Features

- **GitHub Integration**: Fetch README, open issues, and PRs
- **RAG (Retrieval-Augmented Generation)**: Summarises repo context using **LangChain** & **LangGraph**
- **Vector Database**: Uses **Chroma** for semantic search & indexing
- **Caching Layer**: **Redis** to speed up repeated queries
- **Data Persistence**: PostgreSQL for storing metadata
- **Web Gateway**: Exposes APIs for frontend and external integrations
- **Next.js Frontend**: User-friendly dashboard


## 🧠 High-Level Architecture

```
[Next.js Frontend (Radix UI + shadcn/ui)]
        ↓ REST
[Express Gateway (Node.js, Nx-managed)]
        ↓ HTTP
[Agent Service (Node.js + LangGraph.js + LangChain.js)]
        ↓
[Vector DB (Chroma)] ←→ [PostgreSQL] ←→ [Redis Cache]
        ↓
[Ollama LLM runtime / OpenAI API]
```

## 🔧 Tech Stack

| Component         | Purpose                                      |
|--------------------|----------------------------------------------|
| **LangGraph**      | AI state machine for orchestrating tasks     |
| **LangChain**      | LLM abstraction, RAG, and prompt orchestration|
| **MCP Protocol**   | Tool schema interoperability       |
| **Chroma**         | Vector database for embedding search         |
| **PostgreSQL**     | Persistent metadata storage                  |
| **Redis**          | Cache for intermediate results               |
| **Next.js**        | Frontend UI dashboard                        |
| **Nx Monorepo**    | Project management & task runner             |
| **Docker Compose** | Multi-service orchestration                  |


## 📁 Folder Structure

```
oss-maintainer-helper/
├── apps/
│   ├── frontend/        # Next.js 
│   ├── gateway/         # Express.js (API Gateway)
│   └── agent-backend/   # Express.js + LangGraph + LangChain
├── libs/                # Shared TS libraries or types
├── docker/              # Dockerfiles, Promtail config, etc.
├── .github/             # CI workflows
├── docker-compose.yml   # Service orchestration
├── nx.json              # Nx configuration
├── workspace.json       # Nx workspace projects
├── package.json         # JS dependencies
├── .env.example         # Sample environment variables
└── README.md
```

## ⚙️ Agent Nodes

- **retriever_node**: Queries vector DB (issues, PRs, README, etc.)  
- **planner_node**: Classifies query intent  
- **summariser_node**: Uses LLM with RAG context  
- **logger_node**: Logs metadata to PostgreSQL  

## 🔧 Prerequisites

- **Docker & Docker Compose**  
- **pnpm** (`corepack enable` or install manually)  
- **4GB RAM minimum** (8GB recommended)

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
| **Agent**    | [http://localhost:8001](http://localhost:8001) | AI Agent powered by **LangChain** & **LangGraph**                |
| **Chroma**   | [http://localhost:8000](http://localhost:8000) | Vector database                          |
| **Postgres** | `localhost:5432`   | Database                                 |
| **Redis**    | `localhost:6379`   | Cache store                              |

To stop everything:

```bash
docker compose down -v
```

## 🧪 Testing Each Service

### ✅ 1. Agent

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

