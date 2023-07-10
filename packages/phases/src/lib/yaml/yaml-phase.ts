import * as path from 'path';
import { BasePhase } from '../base';
import { IPhase, IPhaseOptionParams, IPhaseTask } from '../types';
import { loadYamlFile } from './yaml-handler';
import { YamlPhaseTask } from './yaml-phase-task';
import { ListHandler } from '../list-handler';

export class YamlPhase extends BasePhase implements IPhase {
  protected config: any = {};
  protected location?: string
  protected parentLocation?: string
  protected fullLocation?: string
  protected configFilePath?: string
  protected loaded = false

  constructor(config: any, opts: IPhaseOptionParams) {
    super(opts);
    this.parentLocation = opts.meta?.parentLocation
    this.config = config;
    const location = config['location']
    this.location = location
    this.fullLocation = this.parentLocation ? path.join(this.parentLocation, location) : location;
    const configFilePath = config.configFile
    this.configFilePath = this.fullLocation ? path.join(this.fullLocation, configFilePath) : configFilePath
  }

  async loadFromConfigFile(filePath?: string) {
    if (this.loaded) return
    try {
      filePath= filePath || this.configFilePath
      if (!filePath) return
      const config: any = await loadYamlFile(filePath);
      if (!config) return;
      this.config = {
        ...this.config,
        ...config
      }
      this.loaded = true
    } catch (e) {
      this.log(`loadYamlFile: error loading file ${filePath}`);
      this.loaded = true
      return;
    }
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
    const meta = {
      location: this.location
    }
    return new YamlPhaseTask(config, { meta, phase: this });
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
    await this.loadFromConfigFile()
    this.log('loadTasks: loading');
    let taskConfigs: any = this.getTasks();
    this.validateTaskConfigs(taskConfigs);
    this.listHandler = this.createListHandler(taskConfigs)
    taskConfigs = this.listHandler.prepare(taskConfigs)
    this.iterate(taskConfigs)
    this.log('loadTasks: loaded');
  }

  iterate(taskConfigs: any[]) {
    taskConfigs.map((taskConfig: any) => {
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
