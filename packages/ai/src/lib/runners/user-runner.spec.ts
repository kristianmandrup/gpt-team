// user-runner spec

import { UserRunner } from './user-runner';

describe('UserRunner', () => {
  let runner: UserRunner;
  const questionMap = {
    add: 'what is 2+2?',
  };

  beforeEach(() => {
    runner = new UserRunner();
    runner.askQuestion = async () => questionMap['add'];
  });

  describe('run', () => {
    it('should run', async () => {
      const response = await runner.run();
      expect(response).toEqual(questionMap['add']);
    });
  });
});
