# Phases

The Phases library consists of the following main interfaces to be implemented to deliver Development Phases functionality:

- `IPhases` iterates and processes several development phases
- `IPhase` processes a single development phases, such as Analysis or Development
- `IPhaseTask` processes a single task in a phases, such as creating Use Case diagrams as part of the Analysis phase

## Phase Implementations

Currently the library comes with two different Phase implementations:

- Yaml (Reads Phases config from a single Yaml file)
- File (Reads Phases config from a folder structure with files)

Note that each of these implementations can be combined, to form a hybrid approach by sub-classing any of the implementation classes.

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
