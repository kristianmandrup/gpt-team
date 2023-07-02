import type { TeamProps } from '@gpt-team/channel';
import { AIMsgAgent } from './ai-msg-agent';
import { MessengerSubject } from './subject';

describe('AIMsgAgent', () => {
  let agent: AIMsgAgent;
  let subject: MessengerSubject;
  beforeEach(() => {
    const team: TeamProps = {
      name: 'ui',
    };
    subject = new MessengerSubject();
    agent = new AIMsgAgent({ team, subject });
  });

  afterEach(async () => {
    await agent.close();
  });

  const expectAgentMsg = (msg: string) => {
    return new Promise((resolve) => {
      agent.setCb(() => {
        agent.setDone();
        expect(agent.getLastMessage()).toEqual(msg);
        resolve(true);
      });
      subject.sendMsg(msg);
    });
  };

  it('should work', async () => {
    await agent.init();
    await agent.start();
    console.log('sending msg');
    await expectAgentMsg('hello');
  });
});
