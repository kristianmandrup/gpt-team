import { AIAdapter } from './ai';

describe('ai', () => {
  const ai = new AIAdapter({});

  it('should work', () => {
    expect(ai).toBeDefined();
  });
});
