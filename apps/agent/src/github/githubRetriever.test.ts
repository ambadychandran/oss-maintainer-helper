import { GitHubRetriever } from './githubRetriever';
import axios from 'axios';

jest.mock('axios');
jest.mock('ioredis');

// Explicitly define mocked axios with a mocked `create`
const mockedAxiosInstance = {
  get: jest.fn(),
};

// Cast axios to a mocked type and add create
(axios as unknown as jest.Mocked<typeof axios>).create = jest
  .fn()
  .mockReturnValue(mockedAxiosInstance);

describe('GitHubRetriever', () => {
  let retriever: GitHubRetriever;

  beforeEach(() => {
    retriever = new GitHubRetriever(); // Uses mocked axios instance
    jest.clearAllMocks();
  });

  it('fetches README successfully', async () => {
    mockedAxiosInstance.get.mockResolvedValueOnce({
      data: { content: Buffer.from('# Test Repo').toString('base64') },
    });

    const readme = await retriever.getReadme('openai/langchain');
    expect(readme).toContain('# Test Repo');
  });

  it('fetches issues successfully', async () => {
    mockedAxiosInstance.get.mockResolvedValueOnce({
      data: [{ id: 1, title: 'Sample issue' }],
    });

    const issues = await retriever.getIssues('openai/langchain');
    expect(issues[0]).toHaveProperty('title', 'Sample issue');
  });

  it('fetches pull requests successfully', async () => {
    mockedAxiosInstance.get.mockResolvedValueOnce({
      data: [{ id: 1, title: 'Sample PR' }],
    });

    const pulls = await retriever.getPullRequests('openai/langchain');
    expect(pulls[0]).toHaveProperty('title', 'Sample PR');
  });

  it('fetches MCP context successfully', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: [{ type: 'readme', content: '# README from MCP' }],
    });

    const result = await retriever.getMCPContext('openai/langchain');
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('type', 'readme');
  });

});
