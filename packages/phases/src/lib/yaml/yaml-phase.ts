import { BasePhase } from '../base';
import { IPhase, IPhaseOptionParams, IPhaseTask } from '../types';
import { YamlPhaseTask } from './yaml-phase-task';

export class YamlPhase extends BasePhase implements IPhase {
  private config: any = {};

  constructor(config: any, opts: IPhaseOptionParams) {
    super(opts);
    console.log('YamlPhase', { config });
    this.config = config;
  }

  getPhases() {
    return this.phases;
  }

  getTasks(): Record<string, any> {
    return this.config.tasks || {};
  }

  getName(): string {
    return this.config.name || 'noname';
  }

  async loadGoal() {
    this.goal = this.config.goal;
  }

  createTask(config: any) {
    return new YamlPhaseTask(config, { phase: this });
  }

  async loadTasks() {
    const taskConfigs: any = this.getTasks();
    if (!taskConfigs) {
      throw new Error('Missing tasks entry in config');
    }
    if (taskConfigs.length == 0) {
      throw new Error('No tasks in config');
    }
    Object.keys(taskConfigs).map((key: string) => {
      const taskConfig: any = taskConfigs[key] as any;
      taskConfig.name = key;
      const task = this.createTask(taskConfig);
      this.addTask(task);
    });
  }

  addTask(task: IPhaseTask) {
    this.callbacks?.onTaskAdded && this.callbacks?.onTaskAdded(task);
    this.tasks.push(task);
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
