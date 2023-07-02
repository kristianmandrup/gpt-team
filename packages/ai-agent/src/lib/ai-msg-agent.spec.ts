import type { TeamProps } from '@gpt-team/channel';
import { AIMsgAgent } from './ai-msg-agent';
import { MessengerSubject } from './subject';

describe.skip('aiAgent', () => {
  const team: TeamProps = {
    name: 'ui',
  };
  const subject = new MessengerSubject();
  const agent = new AIMsgAgent({ team, subject });

  it('should work', () => {
    subject.attach(agent);
    subject.sendMsg('hello');
    expect(agent).toBeDefined();
  });
});
