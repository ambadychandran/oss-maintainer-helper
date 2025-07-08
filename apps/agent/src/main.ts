import express from 'express';
import { StateGraph, END } from '@langchain/langgraph';

export interface GraphState {
  question?: string;
  repo?: string;
  steps?: string[];
  answer?: string;
  retrievedContent?: string;
}

async function retrieverNode(state: GraphState): Promise<GraphState> {
  const steps = [...(state.steps ?? []), 'retrieving'];
  // TODO: fetch README from GitHub and index it in Chroma
  return { ...state, steps, retrievedContent: 'README content' };
}

async function plannerNode(state: GraphState): Promise<GraphState> {
  const steps = [...(state.steps ?? []), 'planning'];
  // TODO: classify intent
  return { ...state, steps };
}

async function summariserNode(state: GraphState): Promise<GraphState> {
  const steps = [...(state.steps ?? []), 'summarising'];
  // TODO: build prompt and call LLM via LangChain.js
  return { ...state, steps, answer: `Summary for ${state.question}` };
}

async function loggerNode(state: GraphState): Promise<GraphState> {
  const steps = [...(state.steps ?? []), 'logging'];
  // TODO: persist metadata to PostgreSQL
  return { ...state, steps };
}

const graph = new StateGraph<GraphState>();

graph.addNode('retriever_node', retrieverNode);
graph.addNode('planner_node', plannerNode);
graph.addNode('summariser_node', summariserNode);
graph.addNode('logger_node', loggerNode);

graph.addEdge('retriever_node', 'planner_node');
graph.addEdge('planner_node', 'summariser_node');
graph.addEdge('summariser_node', 'logger_node');
graph.addEdge('logger_node', END);

graph.setEntryPoint('retriever_node');
graph.setFinishPoint('logger_node');

const agentGraph = graph.compile();

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/query', async (req, res) => {
  const { question, repo } = req.body as GraphState;
  if (!question || !repo) {
    return res.status(400).json({ message: 'question and repo required' });
  }
  const result = await agentGraph.invoke({ question, repo, steps: [] });
  res.json({ answer: result.answer, steps: result.steps });
});

const port = process.env.PORT || 8001;
app.listen(port, () => {
  console.log(`Agent listening on http://localhost:${port}`);
});
