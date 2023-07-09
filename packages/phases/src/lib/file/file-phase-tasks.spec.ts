import * as path from 'path';
import { DirectoryJSON, vol } from 'memfs';
import { FilePhaseTasks } from './file-phase-tasks';

jest.mock('fs', () => jest.requireActual('memfs'));
const basePath = process.cwd();

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
    const phasesConfigYml = `
    order: 
      - analysis
`;

    const taskConfigYml = `
order:
  - use-cases
`;
    const workspace: any = {
      phases: {
        'config.yml': phasesConfigYml,
        analysis: {
          design: {
            'use-cases.md': content.useCases,
            'config.yml': taskConfigYml,
          },
        },
      },
    };

    vol.fromNestedJSON(workspace, basePath);
  });

  it('should process Tasks and read next task from file in folder', async () => {
    const basePath = process.cwd();
    const phasesFolderPath = path.join(basePath, 'phases');
    const phaseFolderPath = path.join(phasesFolderPath, 'analysis');
    // const phases = new FilePhases(basePath);
    // const phase = new FilePhase(phases, phaseFolderPath);
    const tasks = new FilePhaseTasks(phaseFolderPath, { loggingOn: true });
    const task = await tasks.nextTask();
    if (!task) {
      throw new Error('Missing task in test');
    }
    const message = await task.nextMessage();

    // Check that the message matches task file
    expect(message).toEqual(content.useCases);
  });
});
