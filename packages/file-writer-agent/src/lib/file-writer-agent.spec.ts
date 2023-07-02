import { MessageBus, TeamProps } from '@gpt-team/channel';
import { FileWriterAgent } from './file-writer-agent';

describe('FileWriterAgent', () => {
  let agent: FileWriterAgent;

  const msgBus = new MessageBus('amqp://localhost');
  const team: TeamProps = {
    name: 'ui',
  };

  beforeEach(() => {
    agent = new FileWriterAgent({ msgBus, team });
  });

  it('should work', () => {
    expect(agent).toBeDefined();
  });
});
