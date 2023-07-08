import type { IPhase, IPhases, IPhasesOptionParams } from '../types';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { FilePhaseHandler } from './file-phase-handler';
import { FilePhase } from './file-phase';
import { BasePhases } from '../base/base-phases';

export class FilePhases extends BasePhases implements IPhases {
  protected phasesPath: string;
  protected handler: FilePhaseHandler;

  constructor(phasesPath: string, opts: IPhasesOptionParams = {}) {
    super(opts);
    this.handler = new FilePhaseHandler(opts);
    this.phasesPath = phasesPath;
  }

  get ordering() {
    return this.handler.ordering;
  }

  set ordering(order: any) {
    this.handler.ordering = order;
  }

  async loadOrder() {
    if (this.ordering.length > 0) return;
    this.log('loading order');
    const phasesOrderPath = path.join(this.phasesPath, 'phase-order.yml');
    try {
      const file = fs.readFileSync(phasesOrderPath, 'utf8');
      const doc: any = yaml.load(file);
      if (!Array.isArray(doc)) {
        throw new Error(
          `loadOrder: loading order from ${phasesOrderPath}, file must contain an Array of ordered task names`
        );
      }
      this.ordering = doc;
      this.log(`loaded order: ${doc}`);
    } catch (e) {
      console.log(
        `loadOrder: unable to load phase order from ${phasesOrderPath}`,
        e
      );
    }
  }

  createPhase(folderPath: string): IPhase {
    return new FilePhase(folderPath, { phases: this });
  }

  async loadPhases() {
    if (this.phases.length > 0) return;
    this.log('loading phases');
    await this.loadOrder();
    const sortedFolders = this.handler.sortedFoldersFrom(this.phasesPath);
    if (!sortedFolders) {
      throw new Error(
        `loadPhases: No phases folders found for ${this.phasesPath}`
      );
    }
    if (sortedFolders.length == 0) {
      this.log('no phase folders found');
    }
    for (const folderPath of sortedFolders) {
      const phase = this.createPhase(folderPath);
      this.addPhase(phase);
    }
    this.log('loaded phases');
  }

  addPhase(phase: IPhase) {
    const name = phase.getName && phase.getName();
    this.log(`add phase ${name}`);
    this.callbacks?.onPhaseAdded && this.callbacks?.onPhaseAdded(phase);
    this.phases.push(phase);
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
      this.nextPhase();
    }
    this.currentTask = await this.currentPhase?.nextTask();
    return this.currentTask;
  }
}
