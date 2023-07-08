import * as path from 'path';
import { DirectoryJSON, vol } from 'memfs';
import { FilePhaseTasks } from './file-phase-tasks';
import { FilePhase } from './file-phase';
import { FilePhases } from './file-phases';
import { FilePhaseTask } from './file-phase-task';

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
      phases: {
        'phase-order.yml': `- analysis`,
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
    // const phasesFolderPath = path.join(basePath, 'phases');
    const phaseFolderPath = path.join(basePath, 'analysis');
    // const phases = new FilePhases(basePath);
    // const phase = new FilePhase(phases, phaseFolderPath);
    const tasksFolderPath = path.join(phaseFolderPath, 'design');
    const tasks = new FilePhaseTasks(tasksFolderPath);
    const task = await tasks.nextTask();
    if (!task) {
      throw new Error('Missing task in test');
    }
    const message = await task.nextMessage();

    // Check that the message matches task file
    expect(message).toEqual(content.useCases);
  });
});
