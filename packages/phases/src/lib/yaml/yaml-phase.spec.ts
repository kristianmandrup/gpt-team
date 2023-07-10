import * as path from 'path';
import { NestedDirectoryJSON, vol } from 'memfs';
import { YamlPhases } from './yaml-phases';
import { YamlPhase } from './yaml-phase';
import { phasesYaml, developmentYaml, useCasesYaml } from './fixtures';

jest.mock('fs', () => jest.requireActual('memfs'));

describe('YamlPhase', () => {
  const content: any = {
    useCases: 'hello world',
  };

  beforeEach(() => {
    // Reset the in-memory file system before each test
    vol.reset();
    // Create the directory structure
    vol.mkdirSync(path.join(process.cwd()), { recursive: true });

    // set up existing filesystem
    const workspace: NestedDirectoryJSON = {
      phases: {
        'phases.yaml': phasesYaml,
        'development.yml': developmentYaml,
        tasks: {
          'use-cases.yml': useCasesYaml,
        },
      },
    };
    vol.fromNestedJSON(workspace, process.cwd());
  });

  it('should load Tasks from configFile', async () => {
    const basePath = process.cwd();
    const phasesFolderPath = path.join(basePath, 'phases');
    const phases = new YamlPhases(phasesFolderPath);
    const taskConfig = {
      configFile: 'tasks/use-cases.yml',
    };
    const phaseConfig = {
      configFile: 'development.yml',
      tasks: {
        design: taskConfig,
      },
    };
    const meta = {
      basePath: phasesFolderPath,
    };
    const phase = new YamlPhase(phaseConfig, {
      meta,
      phases,
      loggingOn: true,
    });
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
    expect(message).toEqual('determine the main actors');
  });

  it('should process Tasks and read next task from file in folder', async () => {
    const basePath = process.cwd();
    const phasesFolderPath = path.join(basePath, 'phases');
    const phases = new YamlPhases(phasesFolderPath);
    const taskConfig = {
      messages: ['hello world'],
      channel: {
        subscriptions: ['a', 'b'],
      },
    };
    const phaseConfig = {
      tasks: {
        design: taskConfig,
      },
    };
    const phase = new YamlPhase(phaseConfig, { phases, loggingOn: true });
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
