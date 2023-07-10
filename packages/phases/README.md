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

The task `_config.yml` may also include `order` and `ignore` entries and in addition may include channel subscription info.

```yml
ignore:
  - testing
order:
  - use-cases
  - design
channels:
  subscriptions:
    - info
    - ui
    - all
  recipients:
    - all
    - development
```

The `_goal.md` for a phase explains the goal of the phase. It can be used as an initial `system` message sent to the AI when the phase is started to explain to the AI the overall goal of the development phase.

The `_role.md` for a phase explains the role of actors in the phase. It can be used in a similar way to goal.

The `_goal.md` and `_role.md` for a task likewise can be sent to the AI initially when the task is started. If no goal or role can be found for a task it will default to the goal or role of the phase.

Messages can be grouped by adding the `groups` entry to the config file:

```yml
ignore:
  - testing
order:
  - actors
  - use-cases
groups:
  system:
    - how-to-work
  user:
    - ask-for-use-cases
  critique:
    - critique-actors
    - critique-use-cases
```

### Yaml phases loader

This phase loader requires a simple `phases.yaml` file which should contains the full phases and task definitions:

```yml
order:
  - analysis
  - development
location: phases
phases:
  analysis:
    location: analysis
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
          recipients:
            - all
            - development
        messages:
          - ...

  development:
    configFile: development.yml
```

### Groups and parallel execution

You can even design phase groups and task groups which can be made to be processed in parallel using `Promise.all()`

```yml
order:
  - analysis
  - development
location: phases
groups
  - [analysis, design]
  - [development, testing]
phases:
  analysis:
    groups:
      - [use-cases, state-diagrams]
    tasks:
      use-cases:
        - ...
      state-diagrams:
        - ...

  design:
    - ...
  development:
    - ...
  testing:
    - ...
```

### Task messages

For a task you can simply list your messages in a flat list

```yml
messages:
  - Your job is to create code that generates UML diagrams for PlantUML
  - Generate a Use case diagram with main actors
```

Alternatively you can group messages as per their use

```yml
messages:
  system:
    - Your job is to create code that generates UML diagrams for PlantUML
  user:
    - Generate a Use case diagram with main actors
  critique:
    - Expand the use case diagrams with more details
    - Are there any cases missing?
    - Do the use cases fulfill all the requirements? If not, expand the uses cases further
```

The yaml file can be split into multiple smaller files using `location`and `configFile` entries as shown in the example above.
The `location` can be used to indicate a hierarchical folder structure:

- The `configFile` for the `use-cases` task will be loaded from `phases/analysis/tasks/use-cases.yml`.
- The `configFile` for the `development` phase will be loaded from `phases/development.yml`.

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
