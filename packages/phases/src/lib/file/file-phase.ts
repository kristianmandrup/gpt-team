import * as fs from 'fs';
import * as path from 'path';
import { IPhase, IPhases } from '../types';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhaseTasks } from './file-phase-tasks';

export class FilePhase extends FilePhaseHandler implements IPhase {
  private phaseTasks: FilePhaseTasks;
  private folderPath: string;
  private phaseTasksPath: string;
  private goalPath: string;
  private goal = '';
  private done = false;

  isDone(): boolean {
    return this.done;
  }

  setDone(): void {
    this.done = true;
  }

  createTasks(phaseTasksPath: string = this.phaseTasksPath) {
    return new FilePhaseTasks(phaseTasksPath, this);
  }

  constructor(phases: IPhases, folderPath: string) {
    super();
    this.folderPath = folderPath;
    this.goalPath = path.join(this.folderPath, 'goal.md');
    this.phaseTasksPath = path.join(this.folderPath, 'phase-tasks');
    this.phaseTasks = this.createTasks(this.phaseTasksPath);
  }

  get name(): string {
    return path.parse(this.folderPath).name;
  }

  getGoal(): string {
    return this.goal;
  }

  async loadGoal() {
    if (this.goal) return;
    const doc = fs.readFileSync(this.goalPath, 'utf-8');
    this.goal = doc;
  }

  async nextTask() {
    if (this.phaseTasks.isDone()) {
      this.done = true;
      return;
    }
    return this.phaseTasks.nextTask();
  }
}
