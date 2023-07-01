import { MessageBus, TeamProps } from '@gpt-team/channel';
import { AIPhasesAgent } from './ai-phases-agent';
import { YamlPhases } from '@gpt-team/phases';

describe.skip('aiAgent', () => {
  const msgBus = new MessageBus('amqp://localhost');
  const phases = new YamlPhases(process.cwd());
  const team: TeamProps = {
    name: 'ui',
  };
  const agent = new AIPhasesAgent({ msgBus, phases, team });

  it('should work', () => {
    expect(agent).toBeDefined();
  });
});
