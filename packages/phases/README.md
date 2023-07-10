# Phases

The Phases library consists of the following main interfaces to be implemented to deliver Development Phases functionality:

- `IPhases` iterates and processes several development phases
- `IPhase` processes a single development phases, such as Analysis or Development
- `IPhaseTask` processes a single task in a phases, such as creating Use Case diagrams as part of the Analysis phase

## Phase Implementations

Currently the library comes with two different Phase implementations:

- Yaml (Reads Phases config from a single Yaml file)
- File (Reads Phases config from a folder structure with files)

### File phases loader

The file phases loader expects the following type of file structure.

```bash
  \phases
    _config.yml
    \analysis
      _goal.md
      \design
        _config.yml
        _goal.md
        use-cases.txt

```

The phases `_config.yml` file may include `order` and `ignore` entries

```yml
ignore:
  - testing
order:
  - analysis
  - development
  - testing
```

This tells the Phases handler in which order to process the phases and which phases to be ignored (if any).

The task `_config.yml` may also include `order` and `ignore` entries and will shortly include channel subscription info etc.

The `_goal.md` for a phase explains the goal of the phase. It can be used as an initial `system` message sent to the AI when the phase is started to explain to the AI the overall goal of the development phase.

The `_goal.md` for a tak likewise explains the goal of a task and can also be sent to the AI initially when the task is started.

### Yaml phases loader

This phase loader requires a simple `phases.yaml` file which should contains the full phases and task definitions:

```yml
order:
  - analysis
  - development
folder: phases
phases:
  analysis:
    folder: analysis
    goal: 'analyse project'
    order:
      - use-cases
      - design
    tasks:
      use-cases:
        configFile: tasks/use-cases.yml
      design:
        channels:
          subscriptions:
            - ui
        messages:
          - hello world
  development:
    folder: development
    configFile: development.yml
```

In the near future we may well allow this file to be split up in one yaml file per phase.

### Hybrid loaders

The phase loader implementations can be combined, to form a hybrid approach by sub-classing any of the implementation classes. You can also extend the base classes or implement the interfaces to create your own, loading them from a remote API or DB or perhaps control them using a state machine.

Here is an example:

```ts
export class HybridFilePhase extends FilePhase {
  protected tasks: IPhaseTask = [];

  createTasks(phaseTasksPath: string = this.phaseTasksPath) {
    // TODO: read config tasks from a file in phaseTasksPath
    for (const taskConfig of taskConfigList) {
      const task = this.createTask(taskConfig);
      this.tasks.push(task);
    }
  }

  async nextTask() {
    await this.loadTasks();
    const task = this.tasks.shift();
    if (!task) {
      this.done = true;
    }
    return task;
  }
}
```

## Building

Run `nx build phases` to build the library.

## Running unit tests

Run `nx test phases` to execute the unit tests via [Jest](https://jestjs.io).
