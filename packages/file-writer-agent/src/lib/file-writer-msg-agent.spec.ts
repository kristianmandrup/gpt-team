import type { TeamProps } from '@gpt-team/channel';
import { FileWriterMsgAgent } from './file-writer-msg-agent';
import { MessengerSubject } from '@gpt-team/ai-agent';
import * as fs from 'fs-extra';
import { vol } from 'memfs';
import { readFromFile } from './file-ops';
jest.mock('fs', () => jest.requireActual('memfs'));

beforeEach(() => {
  vol.reset(); // Reset the in-memory file system before each test
});

describe('FileWriterMsgAgent', () => {
  let agent: FileWriterMsgAgent;
  let subject: MessengerSubject;
  beforeEach(() => {
    const team: TeamProps = {
      name: 'ui',
    };
    subject = new MessengerSubject();
    // set up existing filesystem
    // vol.fromJSON(
    //   {
    //     'global.css': 'html { background-color: green; }',
    //     'style.css': 'body: {color: red;}',
    //   },
    //   '/tmp/www'
    // );

    agent = new FileWriterMsgAgent({ team, subject });
  });

  afterEach(async () => {
    await agent.close();
    // Reset the mocked fs
    // (fs as any).reset();
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

  it('should write a file to the file system', () => {
    // await agent.init();
    // await agent.start();
    console.log('write files');
    const filePath = 'hello.txt';
    const fileContent = 'hello world';
    agent.fileToFileSystem({ path: filePath, content: fileContent });
    expect(fs.existsSync(filePath)).toBeTruthy();

    // Read from the file and check that the content is correct
    const readContent = readFromFile(filePath);
    expect(readContent).toBe(fileContent);
  });
});
