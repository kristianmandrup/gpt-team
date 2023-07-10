import * as path from 'path';
import { BasePhase } from '../base';
import { IPhase, IPhaseOptionParams, IPhaseTask } from '../types';
import { loadYamlFile } from './yaml-handler';
import { YamlPhaseTask } from './yaml-phase-task';

export class YamlPhase extends BasePhase implements IPhase {
  protected basePath: string;
  protected fullBasePath: string;
  protected location?: string;
  protected parentLocation?: string;
  protected fullLocation?: string;
  protected configFilePath?: string;
  protected loaded = false;
  protected tasksLoaded = false;

  constructor(config: any, opts: IPhaseOptionParams = {}) {
    super(opts);
    const meta = opts.meta || {};
    const { basePath, parentLocation } = meta;
    this.basePath = basePath;
    this.parentLocation = parentLocation;
    this.config = config;
    const location = config['location'];
    this.location = location;
    const fullLocation = parentLocation
      ? path.join(parentLocation, location)
      : location;
    this.fullLocation = fullLocation;
    const fullBasePath = fullLocation
      ? path.join(basePath, fullLocation)
      : basePath;
    this.fullBasePath = fullBasePath;
    this.configFilePath = config['configFile'];
  }

  async loadFromConfigFile(filePath?: string) {
    if (this.loaded) return;
    this.log('loadFromConfigFile: loading');
    try {
      filePath = filePath || this.configFilePath;
      if (!filePath) return;
      const fullFilePath = this.fullBasePath
        ? path.join(this.fullBasePath, filePath)
        : filePath;
      this.log(`loadFromConfigFile: loading from ${fullFilePath}`);
      const config: any = await loadYamlFile(filePath);
      if (!config) {
        this.log('loadFromConfigFile: config file was empty');
        return;
      }
      this.config = {
        ...this.config,
        ...config,
      };
      this.loaded = true;
      this.log('loadFromConfigFile: loaded');
    } catch (e) {
      this.log(`loadYamlFile: error loading file ${filePath}`);
      this.loaded = true;
      this.log('loadFromConfigFile: loaded');
      return;
    }
  }

  getPhases() {
    return this.phases;
  }

  getTaskConfigs(): Record<string, any> {
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
      location: this.fullLocation,
      basePath: this.basePath,
    };
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
    if (this.tasksLoaded) return;
    await this.loadFromConfigFile();
    this.log('loadTasks: loading');
    let taskConfigs: any = this.getTaskConfigs();
    this.validateTaskConfigs(taskConfigs);
    this.listHandler = this.createListHandler(taskConfigs);
    taskConfigs = this.listHandler.prepare(taskConfigs);
    this.iterate(taskConfigs);
    this.log('loadTasks: loaded');
    this.tasksLoaded = true;
  }

  iterate(taskConfigs: any[]) {
    if (taskConfigs.length == 0) {
      this.log('iterate: no task configs to iterate and add');
      return;
    }
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
