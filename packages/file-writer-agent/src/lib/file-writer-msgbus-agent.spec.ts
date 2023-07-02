import { MessageBus, TeamProps } from '@gpt-team/channel';
import { FileWriterMsgBusAgent } from './file-writer-msgbus-agent';

// const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation()
// expect(stderrSpy).toBeCalledWith('something error')
describe('FileWriterAgent', () => {
  let agent: FileWriterMsgBusAgent;

  const msgBus = new MessageBus('amqp://localhost');
  const team: TeamProps = {
    name: 'ui',
  };

  beforeEach(() => {
    agent = new FileWriterMsgBusAgent({ msgBus, team });
  });

  it('should work', () => {
    expect(agent).toBeDefined();
  });
});
