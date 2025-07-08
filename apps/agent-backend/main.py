from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from github_retriever import GitHubRetriever
import os

from langgraph.graph import END, StateGraph

from typing import TypedDict


class Query(BaseModel):
    question: str
    repo: str


class GraphState(TypedDict, total=False):
    question: str
    repo: str
    steps: list[str]
    answer: str
    retrieved_content: str


def retriever_node(state: GraphState) -> GraphState:
    question = state.get("question")
    repo = state.get("repo")
    if not question or not repo:
        raise ValueError("Question and repo are required")

    token = os.getenv("GITHUB_TOKEN")
    redis_url = os.getenv("REDIS_URL")
    retriever = GitHubRetriever(token=token, redis_url=redis_url)
    readme = retriever.get_readme(repo)

    steps = state.get("steps", []) + ["retrieving"]
    return {"steps": steps, "retrieved_content": readme}


def planner_node(state: GraphState) -> GraphState:
    print("planning...")
    steps = state.get("steps", []) + ["planning"]
    return {"steps": steps}


def summariser_node(state: GraphState) -> GraphState:
    print("summarising...")
    steps = state.get("steps", []) + ["summarising"]
    answer = f"Summary for question: {state.get('question')}"
    return {"steps": steps, "answer": answer}


def logger_node(state: GraphState) -> GraphState:
    print("logging...")
    steps = state.get("steps", []) + ["logging"]
    return {"steps": steps}


app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}


def build_graph():
    graph = StateGraph(GraphState)
    graph.add_node("retriever_node", retriever_node)
    graph.add_node("planner_node", planner_node)
    graph.add_node("summariser_node", summariser_node)
    graph.add_node("logger_node", logger_node)

    graph.add_edge("retriever_node", "planner_node")
    graph.add_edge("planner_node", "summariser_node")
    graph.add_edge("summariser_node", "logger_node")
    graph.add_edge("logger_node", END)

    graph.set_entry_point("retriever_node")
    graph.set_finish_point("logger_node")

    return graph.compile()


compiled_graph = build_graph()


@app.post("/query")
async def query_endpoint(payload: Query):
    if not payload.question or not payload.repo:
        raise HTTPException(status_code=400, detail="Question and repo required")
    state: GraphState = {
        "question": payload.question,
        "repo": payload.repo,
        "steps": [],
    }
    result = compiled_graph.invoke(state)
    return {"answer": result.get("answer"), "steps": result.get("steps", [])}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
