import { BasePhase } from '../base';
import { IPhase, IPhaseOptionParams } from '../types';
import { YamlPhaseTask } from './yaml-phase-task';

export class YamlPhase extends BasePhase implements IPhase {
  private config: any = {};

  constructor(config: any, opts: IPhaseOptionParams) {
    super(opts);
    this.config = config;
  }

  getPhases() {
    return this.phases;
  }

  getName(): string {
    return this.config.name;
  }

  async loadGoal() {
    this.goal = this.config.goal;
  }

  createTask(config: any) {
    return new YamlPhaseTask(this, config);
  }

  async loadTasks() {
    for (const config of this.config.tasks) {
      const task = this.createTask(config);
      this.tasks.push(task);
    }
  }

  override async nextTask() {
    await this.loadTasks();
    const task = this.tasks.shift();
    if (!task) {
      this.setCompleted();
    }
    return task;
  }
}
