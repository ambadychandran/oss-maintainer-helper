from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from langgraph.graph import END, StateGraph

from typing import TypedDict


class Query(BaseModel):
    question: str


class GraphState(TypedDict, total=False):
    question: str
    steps: list[str]
    answer: str


def retriever_node(state: GraphState) -> GraphState:
    print("retrieving...")
    steps = state.get("steps", []) + ["retrieving"]
    return {"steps": steps}


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
    if not payload.question:
        raise HTTPException(status_code=400, detail="Question required")
    state: GraphState = {"question": payload.question, "steps": []}
    result = compiled_graph.invoke(state)
    return {"answer": result.get("answer"), "steps": result.get("steps", [])}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
