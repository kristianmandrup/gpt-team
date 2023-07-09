import * as path from 'path';
import { DirectoryJSON, vol } from 'memfs';
import { FilePhases } from './file-phases';
import { IPhase } from '../types';

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

    const phasesConfigYml = `
    order: 
      - analysis
`;

    const taskConfigYml = `
order:
  - use-cases
`;

    const analysisGoal = `to analyze requirements`;

    vol.fromJSON(workspace, process.cwd());
    vol.fromNestedJSON({
      phases: {
        '_config.yml': phasesConfigYml,
        analysis: {
          '_goal.md': analysisGoal,
          design: {
            '_config.yml': taskConfigYml,
            'use-cases.txt': content.useCases,
          },
        },
      },
    });
  });

  describe('loadOrder', () => {
    it('should load phases order from config.yml', async () => {
      const basePath = process.cwd();
      const phasesPath = path.join(basePath, 'phases');
      const phases = new FilePhases(phasesPath, { loggingOn: true });
      expect(async () => await phases.loadConfig()).not.toThrow();
      expect(phases.ordering).toEqual(['analysis']);
    });
  });

  describe('loadPhases', () => {
    it('should process Tasks and read next task from file in folder', async () => {
      const basePath = process.cwd();
      const phasesPath = path.join(basePath, 'phases');
      const phases = new FilePhases(phasesPath);
      expect(async () => await phases.loadPhases()).not.toThrow();
    });
  });

  it('should process Tasks and read next task from file in folder', async () => {
    const basePath = process.cwd();
    const phasesFolderPath = path.join(basePath, 'phases');
    const onPhaseAdded = (phase: IPhase) => {
      console.log('added', phase);
    };
    const phases = new FilePhases(phasesFolderPath, {
      callbacks: { onPhaseAdded },
      loggingOn: true,
    });
    console.log('created', { phases });
    await phases.loadPhases();
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
