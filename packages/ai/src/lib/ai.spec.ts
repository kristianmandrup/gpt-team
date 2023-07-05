import { AIAdapter } from './ai-adapter';

describe('ai', () => {
  const ai = new AIAdapter({});

  it('should work', () => {
    expect(ai).toBeDefined();
  });
});
