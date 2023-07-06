import {
  AIMockAdapter,
  AIMockerWithResponseStack,
  IAIMocker,
} from '../ai-adapter';
import { AiRunner } from './ai-runner';

describe('AiRunner', () => {
  let runner: AiRunner;
  const questionMap = {
    add: 'what is 2+2?',
  };
  const answerMap = {
    add: '4',
  };
  beforeEach(() => {
    const responseStack = ['hello from AI'];
    const mocker: IAIMocker = new AIMockerWithResponseStack(responseStack);
    const aiAdapter = new AIMockAdapter(mocker);
    runner = new AiRunner({ aiAdapter });
  });

  describe('run', () => {
    it('should run', async () => {
      const response = await runner.run();
      expect(response).toEqual(questionMap['add']);
    });
  });
});
