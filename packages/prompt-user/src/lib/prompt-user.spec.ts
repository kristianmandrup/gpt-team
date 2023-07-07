import { promptUser } from './prompt-user';

describe('promptUser', () => {
  it('should work', () => {
    expect(promptUser()).toEqual('prompt-user');
  });
});
