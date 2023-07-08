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
  protected handler: FilePhaseHandler;

  createTasks(phaseTasksPath: string = this.phaseTasksPath) {
    return new FilePhaseTasks(phaseTasksPath, {
      phase: this,
      loggingOn: this.loggingOn,
    });
  }

  constructor(folderPath: string, opts: IPhaseOptionParams) {
    super(opts);
    this.handler = new FilePhaseHandler(opts);
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
    await this.phaseTasks.loadTasks();
    if (this.phaseTasks.isDone()) {
      this.setCompleted();
      return;
    }
    return this.phaseTasks.nextTask();
  }
}
