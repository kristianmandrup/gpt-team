import * as path from 'path';
import { DirectoryJSON, vol } from 'memfs';
import { YamlPhaseTask } from './yaml-phase-task';
import { YamlPhase } from './yaml-phase';
import { YamlPhases } from './yaml-phases';

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
    const phasesFolderPath = path.join(basePath, 'phases');
    const phases = new YamlPhases(phasesFolderPath);
    const taskConfig = {
      channel: {
        subscriptions: ['a', 'b'],
      },
    };
    const phaseConfig = {
      analysis: taskConfig,
    };
    const phase = new YamlPhase(phaseConfig, { phases });
    const task = new YamlPhaseTask(taskConfig, { phase });
    const message = await task.nextMessage();

    // Check that the message matches task file
    expect(message).toEqual(content.useCases);
  });
});
