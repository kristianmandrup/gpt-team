import { AIAgent } from './ai-agent';
import { YamlPhases } from '@gpt-team/phases';

describe.skip('aiAgent', () => {
  const phases = new YamlPhases(process.cwd());
  const team = {
    name: 'ui',
  };
  const agent = new AIAgent({ phases, team });

  it('should work', () => {
    expect(agent).toBeDefined();
  });
});
