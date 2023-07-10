import * as fs from 'fs';
import * as path from 'path';
import { BasePhase } from '../base';
import { IPhase, IPhaseOptionParams, IPhaseTask, ITaskGroup } from '../types';
import { loadYamlFile } from './yaml-handler';
import { YamlPhaseTask } from './yaml-phase-task';
import { TaskGroup } from '../task-group';

export class YamlPhase extends BasePhase implements IPhase {
  protected basePath: string;
  protected fullBasePath: string;
  protected goalPath?: string;
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
    this.goalPath = this.fullBasePath
      ? path.join(this.fullBasePath, '_goal.md')
      : undefined;

    this.configFilePath = config['configFile'];
  }

  async loadAll() {
    await this.loadGoal();
    await this.loadFromConfigFile();
  }

  async loadFromConfigFile(filePath?: string) {
    if (this.loaded) return;
    // await this.loadRole();
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
      this.setGroups(this.config);
      this.loaded = true;
      this.log('loadFromConfigFile: loaded');
    } catch (e) {
      this.log(`loadYamlFile: error loading file ${filePath}`);
      this.loaded = true;
      this.log('loadFromConfigFile: loaded');
      return;
    }
  }

  setGroups(config: any) {
    const groups = config['groups'];
    if (!groups) return;
    if (!Array.isArray(groups)) {
      throw new Error('Invalid groups entry');
    }
    this.groups = groups;
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
    if (this.goal) return;
    try {
      if (!this.goalPath) return;
      const doc = fs.readFileSync(this.goalPath, 'utf-8');
      this.goal = doc;
    } catch (e) {
      console.log(`loadGoal: unable to load goal file from ${this.goalPath}`);
    }
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
    await this.loadAll();
    this.log('loadTasks: loading');
    let taskConfigs: any = this.getTaskConfigs();
    this.validateTaskConfigs(taskConfigs);
    this.listHandler = this.createListHandler(taskConfigs);
    taskConfigs = this.listHandler.prepare(taskConfigs);
    this.iterate(taskConfigs);
    this.iterateGroups();
    this.log('loadTasks: loaded');
    this.tasksLoaded = true;
  }

  iterateGroups() {
    for (const group of this.groups) {
      const taskGroup = new TaskGroup();
      for (const config of group) {
        const task = this.createTask(config);
        taskGroup.addTask(task);
      }
      this.taskGroups.push(taskGroup);
    }
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

  override async nextTaskGroup() {
    await this.loadTasks();
    this.currentTaskGroup = this.taskGroups.shift();
    if (!this.currentTaskGroup) {
      this.setCompleted();
    }
    return this.currentTaskGroup;
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
