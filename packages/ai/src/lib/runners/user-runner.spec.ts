// user-runner spec

import { MockUserWithResponseStack } from './mock-user';
import { UserRunner } from './user-runner';

describe('UserRunner', () => {
  let runner: UserRunner;
  const questionMap = {
    add: 'what is 2+2?',
  };
  const answerMap = {
    add: '4',
  };

  beforeEach(() => {
    const userResponses = ['4'];
    const mockUser = new MockUserWithResponseStack(userResponses);
    runner = new UserRunner(mockUser);
  });

  describe('run', () => {
    it('should run', async () => {
      const response = await runner.run();
      expect(response).toContain(answerMap['add']);
    });
  });
});
