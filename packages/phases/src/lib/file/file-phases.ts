import type { IPhase, IPhases } from '../types';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhase } from './file-phase';
import { BasePhases } from '../base/base-phases';

export class FilePhases extends BasePhases implements IPhases {
  protected basePath: string;
  protected phasesPath: string;
  protected handler: FilePhaseHandler;

  constructor(basePath: string) {
    super();
    this.handler = new FilePhaseHandler();
    this.basePath = basePath;
    this.phasesPath = path.join(this.basePath, 'phases');
  }

  async loadOrder() {
    const phasesOrderPath = path.join(this.phasesPath, 'phase-order.yml');
    try {
      const file = fs.readFileSync(phasesOrderPath, 'utf8');
      const doc = yaml.load(file);
      this.handler.ordering = doc;
    } catch (e) {
      console.log(e);
    }
  }

  createPhase(folderPath: string): IPhase {
    return new FilePhase(folderPath, { phases: this });
  }

  async loadPhases() {
    if (this.phases.length > 0) return;
    const sortedFolders = this.handler.sortedFoldersFrom(this.phasesPath);
    for (const folderPath of sortedFolders) {
      const phase = this.createPhase(folderPath);
      this.phases.push(phase);
    }
  }

  override async nextPhase() {
    await this.loadPhases();
    this.currentPhase = this.phases.shift();
    if (!this.currentPhase) {
      this.setCompleted();
      return;
    }
    return this.currentPhase;
  }

  override async nextTask() {
    if (this.isDone()) return;
    if (!this.currentPhase) {
      this.currentTask && this.onTaskCompleted(this.currentTask);
      this.nextPhase();
    }
    this.currentTask = await this.currentPhase?.nextTask();
    return this.currentTask;
  }
}
