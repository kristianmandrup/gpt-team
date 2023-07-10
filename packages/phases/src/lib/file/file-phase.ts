import * as fs from 'fs';
import * as path from 'path';
import { IPhase, IPhaseOptionParams } from '../types';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhaseTasks } from './file-phase-tasks';
import { BasePhase } from '../base/base-phase';

export class FilePhase extends BasePhase implements IPhase {
  protected phaseTasks: FilePhaseTasks;
  protected folderPath: string;
  protected phaseTasksPath: string;
  protected goalPath: string;
  protected rolePath: string;
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
    this.goalPath = path.join(this.folderPath, '_goal.md');
    this.rolePath = path.join(this.folderPath, '_role.md');
    this.phaseTasksPath = path.join(this.folderPath, '.');
    this.phaseTasks = this.createTasks(this.phaseTasksPath);
  }

  getName(): string {
    return path.parse(this.folderPath).name;
  }

  async loadGoal() {
    if (this.goal) return;
    try {
      if (!this.goalPath) return;
      const doc = fs.readFileSync(this.goalPath, 'utf-8');
      this.goal = doc;
    } catch (_) {
      this.log('no goal file found');
    }
  }

  async loadRole() {
    if (this.role) return;
    try {
      if (!this.rolePath) return;
      const doc = fs.readFileSync(this.rolePath, 'utf-8');
      this.role = doc;
    } catch (_) {
      this.log('no role file found');
    }
  }

  async loadAll() {
    await this.loadGoal();
    await this.loadRole();
  }

  override async nextTask() {
    await this.loadAll();
    await this.phaseTasks.loadTasks();
    if (this.phaseTasks.isDone()) {
      this.setCompleted();
      return;
    }
    return this.phaseTasks.nextTask();
  }
}
