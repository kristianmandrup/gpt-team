import * as path from 'path';
import { DirectoryJSON, vol } from 'memfs';
import { FilePhaseTask } from './file-phase-task';
import { FilePhase } from './file-phase';
import { FilePhases } from './file-phases';

jest.mock('fs', () => jest.requireActual('memfs'));

describe('FilePhaseTask', () => {
  const content: any = {
    useCases: 'hello world',
  };

  beforeEach(() => {
    // Reset the in-memory file system before each test
    vol.reset();
    // Create the directory structure
    vol.mkdirSync(path.join(process.cwd()), { recursive: true });
    // set up existing filesystem
    const workspace: DirectoryJSON = {
      'style.css': 'body: {color: red;}',
    };
    vol.fromJSON(workspace, process.cwd());
    vol.fromNestedJSON({
      analysis: {
        design: {
          'use-cases.txt': content.useCases,
        },
      },
    });
  });

  it('should read task from file', async () => {
    const basePath = process.cwd();
    const phaseFolderPath = path.join(basePath, 'analysis');
    const phases = new FilePhases(basePath);
    const phase = new FilePhase(phaseFolderPath, { phases });
    const taskFolderPath = path.join(phaseFolderPath, 'design');
    const task = new FilePhaseTask(taskFolderPath, { phase });
    const message = await task.nextMessage();

    // Check that the message matches task file
    expect(message).toEqual(content.useCases);
  });
});
