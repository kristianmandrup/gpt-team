import { BasePhase } from '../base';
import { IPhase, IPhaseOptionParams, IPhaseTask } from '../types';
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

  validateTaskConfigs(taskConfigs: any) {
    if (!taskConfigs) {
      throw new Error('Missing tasks entry in config');
    }
    if (taskConfigs.length == 0) {
      throw new Error('No tasks in config');
    }
  }

  async loadTasks() {
    this.log('loadTasks: loading');
    const taskConfigs: any = this.getTasks();
    this.validateTaskConfigs(taskConfigs);
    Object.keys(taskConfigs).map((key: string) => {
      const taskConfig: any = taskConfigs[key] as any;
      taskConfig.name = key;
      const task = this.createTask(taskConfig);
      this.addTask(task);
    });
    this.log('loadTasks: loaded');
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
