import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  IPhase,
  IPhaseTask,
  IPhaseTasks,
  IPhaseTasksOptionParams,
} from '../types';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhaseTask } from './file-phase-task';

export class FilePhaseTasks extends FilePhaseHandler implements IPhaseTasks {
  protected tasksPath: string;
  protected tasks: IPhaseTask[] = [];
  protected currentTask?: IPhaseTask;
  protected done = false;
  protected phase?: IPhase;

  isDone(): boolean {
    return this.done;
  }

  getPhase() {
    return this.phase;
  }

  constructor(tasksPath: string, opts: IPhaseTasksOptionParams) {
    super(opts);
    const { phase } = opts;
    this.phase = phase;
    this.tasksPath = tasksPath;
  }

  async loadOrder() {
    const tasksOrderPath = path.join(this.tasksPath, 'task-order.yml');
    this.log(`loadOrder: loading from ${tasksOrderPath}`);
    try {
      const file = fs.readFileSync(tasksOrderPath, 'utf8');
      const doc = yaml.load(file);
      if (!Array.isArray(doc)) {
        throw new Error(
          `loadOrder: loading order from ${tasksOrderPath}, file must contain an Array of ordered task names`
        );
      }
      this.ordering = doc;
      this.log(`loadOrder: loaded task order`);
    } catch (e) {
      this.log(`loadOrder error: ${e}`);
      console.log(e);
    }
  }

  createTask(folderPath: string) {
    return new FilePhaseTask(folderPath, { phase: this.getPhase() });
  }

  async loadTasks() {
    if (this.tasks.length > 0) return;
    this.log(`loadTasks`);
    await this.loadOrder();
    const folders = this.readFolders(this.tasksPath);
    const sortedFolders = folders.sort((f1: string, f2: string) => {
      return this.indexOf(f1) <= this.indexOf(f2) ? 1 : 0;
    });
    if (!sortedFolders) {
      throw new Error(`loadTasks: No task folders found for ${this.tasksPath}`);
    }
    if (sortedFolders.length == 0) {
      this.log(`loadPhases: No task folders found for ${this.tasksPath}`);
    }
    for (const folderPath of sortedFolders) {
      const task = this.createTask(folderPath);
      this.addTask(task);
    }
  }

  addTask(task: IPhaseTask) {
    const name = task.getName && task.getName();
    this.log(`add task ${name}`);
    this.tasks.push(task);
  }

  async nextTask() {
    await this.loadTasks();
    if (this.isDone()) return;
    if (!this.tasks || this.tasks.length == 0) {
      this.loadTasks();
    }
    this.currentTask = this.tasks.shift();
    if (!this.currentTask) {
      this.done = true;
    }
    return this.currentTask;
  }
}
