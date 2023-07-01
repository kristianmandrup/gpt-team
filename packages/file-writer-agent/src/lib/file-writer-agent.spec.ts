import { fileWriterAgent } from './file-writer-agent';

describe('fileWriterAgent', () => {
  it('should work', () => {
    expect(fileWriterAgent()).toEqual('file-writer-agent');
  });
});
