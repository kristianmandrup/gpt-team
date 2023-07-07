import {
  AIMockAdapter,
  AIMockerWithResponseStack,
  IAIMocker,
} from '@gpt-team/packages/ai-adapter';
import { AiAndUserRunner } from './ai-and-user-runner';
import { AiRunner } from './ai-runner';
import { MockUserWithResponseStack } from './mock-user';
import { UserRunner } from './user-runner';

describe('AiRunner', () => {
  let runner: AiAndUserRunner;
  const questionMap = {
    add: 'what is 2+2?',
  };

  beforeEach(() => {
    const responseStack = [{ content: 'hello from AI' }];
    const mocker: IAIMocker = new AIMockerWithResponseStack(responseStack);
    const aiAdapter = new AIMockAdapter(mocker);
    const aiRunner = new AiRunner({ aiAdapter });
    const userResponses = ['hi'];
    const mockUser = new MockUserWithResponseStack(userResponses);
    const userRunner = new UserRunner(mockUser);
    runner = new AiAndUserRunner({ aiRunner, userRunner });
  });

  describe('run', () => {
    it('should run', async () => {
      const response = await runner.run();
      expect(response).toEqual(questionMap['add']);
    });
  });
});
