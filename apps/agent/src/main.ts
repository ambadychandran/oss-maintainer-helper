import express from 'express';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';

//Define the state schema using Annotation.Root
const GraphStateAnnotation = Annotation.Root({
  question: Annotation<string>(),
  repo: Annotation<string>(),
  steps: Annotation<string[]>({
    reducer: (left, right) => [...(left ?? []), ...(right ?? [])],
    default: () => [],
  }),
  answer: Annotation<string>(),
  retrievedContent: Annotation<string>(),
});

export type GraphState = typeof GraphStateAnnotation.State;

async function retrieverNode(state: GraphState) {
  // TODO: fetch README from GitHub and index it in Chroma
  return {
    steps: ['retrieving'],
    retrievedContent: 'README content',
  };
}

async function plannerNode(state: GraphState) {
  // TODO: classify intent
  return {
    steps: ['planning'],
  };
}

async function summariserNode(state: GraphState) {
  // TODO: build prompt and call LLM via LangChain.js
  return {
    steps: ['summarising'],
    answer: `Summary for ${state.question}`,
  };
}

async function loggerNode(state: GraphState) {
  // TODO: persist metadata to PostgreSQL
  return {
    steps: ['logging'],
  };
}

//Build graph with Annotation.Root
const graph = new StateGraph(GraphStateAnnotation)
  .addNode('retriever_node', retrieverNode)
  .addNode('planner_node', plannerNode)
  .addNode('summariser_node', summariserNode)
  .addNode('logger_node', loggerNode)
  .addEdge(START, 'retriever_node')
  .addEdge('retriever_node', 'planner_node')
  .addEdge('planner_node', 'summariser_node')
  .addEdge('summariser_node', 'logger_node')
  .addEdge('logger_node', END);

const agentGraph = graph.compile();

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/query', async (req, res): Promise<void> => {
  const { question, repo } = req.body;
  if (!question || !repo) {
    res.status(400).json({ message: 'question and repo required' });
    return;
  }

  const result = await agentGraph.invoke({ question, repo, steps: [] });
  res.json({ answer: result.answer, steps: result.steps });
});

const port = process.env.PORT || 8001;
app.listen(port, () => {
  console.log(`Agent listening on http://localhost:${port}`);
});
