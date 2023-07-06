import { AIChatGPTAdapter } from '../ai-adapter';
import { AiAndUserRunner } from './ai-and-user-runner';
import { AiRunner } from './ai-runner';

describe('AiRunner', () => {
  let runner: AiAndUserRunner;
  const questionMap = {
    add: 'what is 2+2?',
  };

  beforeEach(() => {
    const aiAdapter = new AIChatGPTAdapter();
    const aiRunner = new AiRunner({ aiAdapter });
    runner = new AiAndUserRunner({ aiRunner });
  });

  describe('run', () => {
    it('should run', async () => {
      const response = await runner.run();
      expect(response).toEqual(questionMap['add']);
    });
  });
});
