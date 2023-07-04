import * as path from 'path';
import { DirectoryJSON, vol } from 'memfs';
import { FilePhaseTasks } from './file-phase-tasks';
import { FilePhase } from './file-phase';
import { FilePhases } from './file-phases';
import { FilePhaseTask } from './file-phase-task';

jest.mock('fs', () => jest.requireActual('memfs'));

describe('FilePhases', () => {
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
      phases: {
        analysis: {
          design: {
            'use-cases.txt': content.useCases,
          },
        },
      },
    });
  });

  it('should process Tasks and read next task from file in folder', async () => {
    const basePath = process.cwd();
    const phasesFolderPath = path.join(basePath, 'phases');
    const phases = new FilePhases(phasesFolderPath);
    const phase = await phases.nextPhase();
    if (!phase) {
      throw new Error('Missing phase in test');
    }
    const task = await phase?.nextTask();
    if (!task) {
      throw new Error('Missing task in test');
    }
    if (!task) {
      throw new Error('Missing task in test');
    }
    const message = await task.nextMessage();

    // Check that the message matches task file
    expect(message).toEqual(content.useCases);
  });
});
