import * as fs from 'fs';
import * as path from 'path';
import { IPhase, IPhaseOptionParams, IPhases } from '../types';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhaseTasks } from './file-phase-tasks';
import { BasePhase } from '../base/base-phase';

export class FilePhase extends BasePhase implements IPhase {
  protected phaseTasks: FilePhaseTasks;
  protected folderPath: string;
  protected phaseTasksPath: string;
  protected goalPath: string;
  protected phases?: IPhases;
  protected handler: FilePhaseHandler;

  createTasks(phaseTasksPath: string = this.phaseTasksPath) {
    return new FilePhaseTasks(phaseTasksPath, this);
  }

  constructor(folderPath: string, { phases, callbacks }: IPhaseOptionParams) {
    super();
    this.handler = new FilePhaseHandler();
    this.phases = phases;
    this.callbacks = callbacks;
    this.folderPath = folderPath;
    this.goalPath = path.join(this.folderPath, 'goal.md');
    this.phaseTasksPath = path.join(this.folderPath, 'phase-tasks');
    this.phaseTasks = this.createTasks(this.phaseTasksPath);
  }

  getName(): string {
    return path.parse(this.folderPath).name;
  }

  async loadGoal() {
    if (this.goal) return;
    const doc = fs.readFileSync(this.goalPath, 'utf-8');
    this.goal = doc;
  }

  override async nextTask() {
    if (this.phaseTasks.isDone()) {
      this.setCompleted();
      return;
    }
    return this.phaseTasks.nextTask();
  }
}
