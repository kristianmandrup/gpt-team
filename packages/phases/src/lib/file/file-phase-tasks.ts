import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  IPhase,
  IPhaseTask,
  IPhaseTasks,
  IPhaseTasksOptionParams,
  PhaseCallbacks,
} from '../types';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhaseTask } from './file-phase-task';

export class FilePhaseTasks extends FilePhaseHandler implements IPhaseTasks {
  protected tasksPath: string;
  protected tasks: IPhaseTask[] = [];
  protected currentTask?: IPhaseTask;
  protected done = false;
  protected phase?: IPhase;
  protected callbacks?: PhaseCallbacks;

  isDone(): boolean {
    return this.done;
  }

  getPhase() {
    return this.phase;
  }

  constructor(tasksPath: string, opts: IPhaseTasksOptionParams = {}) {
    super(opts);
    this.callbacks = opts.callbacks;
    const { phase } = opts;
    this.phase = phase;
    this.tasksPath = tasksPath;
  }

  validateArray(name: string, list: any, filePath: string) {
    if (!Array.isArray(list)) {
      throw new Error(
        `loadOrder: loading ${name} from ${filePath}, file must contain an Array of task names`
      );
    }
  }

  setOrder(order: any, filePath: string) {
    if (!order) return;
    this.validateArray('order', order, filePath);
    this.ordering = order;
  }

  setIgnore(ignore: any, filePath: string) {
    if (!ignore) return;
    this.validateArray('ignore', ignore, filePath);
    this.ignored = ignore;
  }

  async loadOrder() {
    const filePath = path.join(this.tasksPath, 'config.yml');
    this.log(`loadOrder: loading from ${filePath}`);
    try {
      const file = fs.readFileSync(filePath, 'utf8');
      const doc: any = yaml.load(file);
      const ignore = doc['ignore'];
      this.setIgnore(ignore, filePath);
      const order = doc['order'];
      this.setOrder(order, filePath);
    } catch (e) {
      this.log(`loadOrder error: ${e}`);
      console.log(e);
    }
  }

  createTask(folderPath: string) {
    return new FilePhaseTask(folderPath, { phase: this.getPhase() });
  }

  getFolders() {
    const folders = this.readFolders(this.tasksPath);
    if (this.ordering.length == 0) return folders;
    const sortedFolders = folders.sort((f1: string, f2: string) => {
      return this.indexOf(f1) <= this.indexOf(f2) ? 1 : 0;
    });
    if (!sortedFolders) {
      throw new Error(`loadTasks: No task folders found for ${this.tasksPath}`);
    }
    if (sortedFolders.length == 0) {
      this.log(`loadPhases: No task folders found for ${this.tasksPath}`);
    }
    return sortedFolders;
  }

  async loadTasks() {
    if (this.tasks.length > 0) return;
    this.log(`loadTasks`);
    await this.loadOrder();
    const folders = this.getFolders();
    for (const folderPath of folders) {
      const task = this.createTask(folderPath);
      this.addTask(task);
    }
  }

  addTask(task: IPhaseTask) {
    const name = task.getName && task.getName();
    this.log(`add task ${name}`);
    this.callbacks?.onTaskAdded && this.callbacks?.onTaskAdded(task);
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
