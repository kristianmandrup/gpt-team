import { IPhase, IPhaseTask, IPhases } from '../types';
import { YamlPhaseTask } from './yaml-phase-task';

export class YamlPhase implements IPhase {
  private goal = '';
  private done = false;
  private config: any = {};
  private tasks: IPhaseTask[] = [];
  private phases?: IPhases;

  isDone(): boolean {
    return this.done;
  }

  setDone(): void {
    this.done = true;
  }

  constructor(config: any, phases?: IPhases) {
    this.config = config;
    this.phases = phases;
  }

  getPhases() {
    return this.phases;
  }

  get name(): string {
    return this.config.name;
  }

  getGoal(): string {
    return this.goal;
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

  async nextTask() {
    await this.loadTasks();
    const task = this.tasks.shift();
    if (!task) {
      this.done = true;
    }
    return task;
  }
}
