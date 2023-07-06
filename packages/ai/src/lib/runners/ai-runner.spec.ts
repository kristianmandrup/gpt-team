import { AIChatGPTAdapter } from '../ai-adapter';
import { AiRunner } from './ai-runner';

describe('AiRunner', () => {
  let runner: AiRunner;
  const questionMap = {
    add: 'what is 2+2?',
  };

  beforeEach(() => {
    const aiAdapter = new AIChatGPTAdapter();
    runner = new AiRunner({ aiAdapter });
  });

  describe('run', () => {
    it('should run', async () => {
      const response = await runner.run();
      expect(response).toEqual(questionMap['add']);
    });
  });
});
