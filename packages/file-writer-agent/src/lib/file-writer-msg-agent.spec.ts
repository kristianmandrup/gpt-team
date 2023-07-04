import * as fs from 'fs-extra';
import * as path from 'path';
import type { TeamProps } from '@gpt-team/channel';
import { FileWriterMsgAgent } from './file-writer-msg-agent';
import { MessengerSubject } from '@gpt-team/ai-agent';
import { vol, DirectoryJSON } from 'memfs';
import { readFromFile, writeToFile } from './file-ops';
jest.mock('fs', () => jest.requireActual('memfs'));

describe('FileWriterMsgAgent', () => {
  let agent: FileWriterMsgAgent;
  let subject: MessengerSubject;
  beforeEach(() => {
    const team: TeamProps = {
      name: 'ui',
    };
    subject = new MessengerSubject();
    // Reset the in-memory file system before each test
    vol.reset();
    // Create the directory structure
    vol.mkdirSync(path.join(process.cwd()), { recursive: true });

    // set up existing filesystem
    const workspace: DirectoryJSON = {
      'style.css': 'body: {color: red;}',
    };
    vol.fromJSON(workspace, process.cwd());

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

  it.skip('should work', async () => {
    await agent.init();
    await agent.start();
    console.log('sending msg');
    await expectAgentMsg('hello');
  });

  describe('writing files', () => {
    it('should write to and read from a file', () => {
      const fileName = 'hello.txt';
      const fileContent = 'hello world';
      const filePath = path.join(process.cwd(), fileName);

      writeToFile(filePath, fileContent); // Write to the file

      // Check that the file was written
      expect(fs.existsSync(filePath)).toBeTruthy();

      // Read from the file and check that the content is correct
      const readContent = readFromFile(filePath);
      expect(readContent).toBe(fileContent);
    });

    it('should write a file to the file system', () => {
      // await agent.init();
      // await agent.start();
      console.log('write files');
      const filePath = '/hello.txt';
      const fileContent = 'hello world';
      // set custom writeFile
      agent.setMeta({ writeToFile });
      agent.fileToFileSystem({ path: filePath, content: fileContent });
      expect(fs.existsSync(filePath)).toBeTruthy();

      // Read from the file and check that the content is correct
      const readContent = readFromFile(filePath);
      expect(readContent).toBe(fileContent);
    });
  });
});
