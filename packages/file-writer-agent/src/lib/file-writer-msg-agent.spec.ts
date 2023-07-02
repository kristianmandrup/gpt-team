import type { TeamProps } from '@gpt-team/channel';
import { FileWriterMsgAgent } from './file-writer-msg-agent';
import { MessengerSubject } from '@gpt-team/ai-agent';
// fs-extra is used for demonstrational purposes
import * as fs from 'fs-extra';
import { vol } from 'memfs';
// mock `fs` if you use either `fs` or `fs-extra`
jest.mock('fs');
// mock `fs/promises` if you use it either in code or tests
jest.mock('fs/promises');

describe('FileWriterMsgAgent', () => {
  let agent: FileWriterMsgAgent;
  let subject: MessengerSubject;
  beforeEach(() => {
    const team: TeamProps = {
      name: 'ui',
    };
    subject = new MessengerSubject();
    vol.fromJSON(
      {
        'global.css': 'html { background-color: green; }',
        'style.css': 'body: {color: red;}',
      },
      '/tmp/www'
    );

    agent = new FileWriterMsgAgent({ team, subject });
  });

  afterEach(async () => {
    await agent.close();
    // Reset the mocked fs
    (fs as any).reset();
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
