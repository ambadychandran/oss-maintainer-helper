# Architecture

```mermaid
flowchart LR
  subgraph UI[Next.js Frontend]
    F[Ask: repo + question]
  end

  subgraph GW[Express Gateway]
    GWQ[/POST /query/]
  end

  subgraph AG[Agent (Node.js + LangGraph.js)]
    R[retriever_node]\nOctokit + cache
    S[summariser_node]\nLLM call
    L[logger_node]\nstructured logs
  end

  subgraph Data[Infra]
    RD[(Redis)]
    CH[(Chroma Vector DB)]
  end

  F --> GWQ --> AG
  AG --> R --> RD
  R --> CH
  R --> S --> L
  S --> GWQ
```
