import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { IPhase, IPhaseTask, IPhaseTasks } from '../types';
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

  constructor(tasksPath: string, phase?: IPhase) {
    super();
    this.phase = phase;
    this.tasksPath = tasksPath;
  }

  async loadOrder() {
    const tasksOrderPath = path.join(this.tasksPath, 'task-order.yml');
    try {
      const file = fs.readFileSync(tasksOrderPath, 'utf8');
      const doc = yaml.load(file);
      if (!Array.isArray(doc)) {
        throw new Error(
          `loadOrder: loading order from ${tasksOrderPath}, file must contain an Array of ordered task names`
        );
      }
      this.ordering = doc;
    } catch (e) {
      console.log(e);
    }
  }

  createTask(folderPath: string) {
    return new FilePhaseTask(folderPath, { phase: this.getPhase() });
  }

  async loadTasks() {
    if (this.tasks.length > 0) return;
    await this.loadOrder();
    const files = fs.readdirSync(this.tasksPath);
    const useFolders = files.filter((f) => this.fileFilter(f));
    const sortedFolders = useFolders.sort((f1: string, f2: string) => {
      return this.indexOf(f1) <= this.indexOf(f2) ? 1 : 0;
    });
    for (const folderPath of sortedFolders) {
      const task = this.createTask(folderPath);
      this.tasks.push(task);
    }
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
