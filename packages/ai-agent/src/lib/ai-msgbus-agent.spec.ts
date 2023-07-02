import { MessageBus, TeamProps } from '@gpt-team/channel';
import { AIMsgBusAgent } from './ai-msgbus-agent';

describe.skip('aiAgent', () => {
  const msgBus = new MessageBus('amqp://localhost');
  const team: TeamProps = {
    name: 'ui',
  };
  const agent = new AIMsgBusAgent({ msgBus, team });

  it('should work', () => {
    expect(agent).toBeDefined();
  });
});
