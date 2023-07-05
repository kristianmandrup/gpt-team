import type { IPhase, IPhases } from '../types';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhase } from './file-phase';

export class FilePhases extends FilePhaseHandler implements IPhases {
  protected phases: IPhase[] = [];
  protected currentPhase?: IPhase;
  protected basePath: string;
  protected phasesPath: string;
  protected done = false;

  isDone(): boolean {
    return this.done;
  }

  setDone() {
    this.done = true;
  }

  constructor(basePath: string) {
    super();
    this.basePath = basePath;
    this.phasesPath = path.join(this.basePath, 'phases');
  }

  async loadOrder() {
    const phasesOrderPath = path.join(this.phasesPath, 'phase-order.yml');
    try {
      const file = fs.readFileSync(phasesOrderPath, 'utf8');
      const doc = yaml.load(file);
      this.ordering = doc;
    } catch (e) {
      console.log(e);
    }
  }

  createPhase(folderPath: string): IPhase {
    return new FilePhase(folderPath, this);
  }

  async loadPhases() {
    if (this.phases.length > 0) return;
    const sortedFolders = this.sortedFoldersFrom(this.phasesPath);
    for (const folderPath of sortedFolders) {
      const phase = this.createPhase(folderPath);
      this.phases.push(phase);
    }
  }

  async nextPhase() {
    await this.loadPhases();
    this.currentPhase = this.phases.shift();
    if (!this.currentPhase) {
      this.done = true;
    }
    return this.currentPhase;
  }

  async nextTask() {
    if (this.isDone()) return;
    if (!this.currentPhase) {
      this.nextPhase();
    }
    return this.currentPhase?.nextTask();
  }
}
