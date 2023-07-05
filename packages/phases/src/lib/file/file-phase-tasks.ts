import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { IPhase, IPhaseTask, IPhaseTasks } from '../types';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhaseTask } from './file-phase-task';

export class FilePhaseTasks extends FilePhaseHandler implements IPhaseTasks {
  private tasksPath: string;
  private tasks: IPhaseTask[] = [];
  private currentTask?: IPhaseTask;
  private done = false;
  private phase?: IPhase;

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

  // TODO: only folders
  override fileFilter(file: string) {
    return this.indexof(file) >= 0;
  }

  async loadOrder() {
    const tasksOrderPath = path.join(this.tasksPath, 'task-order.yml');
    try {
      const file = fs.readFileSync(tasksOrderPath, 'utf8');
      const doc = yaml.load(file);
      this.ordering = doc;
    } catch (e) {
      console.log(e);
    }
  }

  createTask(folderPath: string) {
    return new FilePhaseTask(folderPath, this.getPhase());
  }

  async loadTasks() {
    if (this.tasks.length > 0) return;
    const files = fs.readdirSync(this.tasksPath);
    const useFolders = files.filter((f) => this.fileFilter(f));
    const sortedFolders = useFolders.sort((f1: string, f2: string) => {
      return this.indexof(f1) <= this.indexof(f2) ? 1 : 0;
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