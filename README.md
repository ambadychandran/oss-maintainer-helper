# OSS Maintainer Helper

A fully open-source, agentic RAG app to explore and query GitHub projects using LangGraph, LangChain, and local LLMs.

## 🧱 Tech Stack

- **Monorepo:** Nx (with pnpm)
- **Frontend:** Next.js + Radix UI + shadcn/ui
- **API Gateway:** Express.js (Node)
- **Agent Backend:** LangGraph.js + LangChain.js (Node, Nx app `apps/agent`)
- **Vector DB:** Chroma
- **Database:** PostgreSQL
- **LLMs:** Ollama (local) or OpenAI-compatible APIs
- **Cache:** Redis
- **Observability:** Loki, Promtail, Grafana
- **Tool Protocol:** MCP (Model Context Protocol)

## 🚀 Local Dev

```bash
pnpm install
docker-compose up --build
```

Then visit:

http://localhost:3000 — Frontend

http://localhost:4000 — Gateway

http://localhost:8001/health — Agent API

📜 License
MIT Licensed.
