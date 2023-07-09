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
  const basePath = process.cwd();

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

  it('should read task from file', async () => {
    console.log({ basePath });
    const phasesFolderPath = path.join(basePath, 'phases');
    const phaseFolderPath = path.join(phasesFolderPath, 'analysis');
    const phases = new FilePhases(phasesFolderPath);
    const phase = new FilePhase(phaseFolderPath, { phases });
    const taskFolderPath = path.join(phaseFolderPath, 'design');
    const task = new FilePhaseTask(taskFolderPath, { phase, loggingOn: true });
    const message = await task.nextMessage();
    console.log(task);
    // Check that the message matches task file
    expect(message).toEqual(content.useCases);
  });
});
