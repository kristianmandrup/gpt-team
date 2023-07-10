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
  public loadedConfig = false;

  constructor(phasesPath: string, opts: IPhasesOptionParams = {}) {
    super(opts);
    this.handler = new FilePhaseHandler(opts);
    this.phasesPath = phasesPath;
  }

  get ordering() {
    return this.handler.ordering;
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
    this.log('load and set order');
    this.validateArray('order', order, filePath);
    this.handler.ordering = order;
  }

  setIgnore(ignore: any, filePath: string) {
    if (!ignore) return;
    this.log('load and set ignore');
    this.validateArray('ignore', ignore, filePath);
    this.handler.ignored = ignore;
  }

  async loadConfig() {
    this.log('loadConfig: loading');
    if (this.loadedConfig) return;
    const filePath = path.join(this.phasesPath, '_config.yml');
    try {
      const file = fs.readFileSync(filePath, 'utf8');
      const doc: any = yaml.load(file);
      this.log(`loadConfig: loaded config: ${doc}`);
      this.loadedConfig = true;
      const ignore = doc['ignore'];
      this.setIgnore(ignore, filePath);
      const order = doc['order'];
      this.setOrder(order, filePath);
    } catch (e) {
      this.log(`loadOrder: unable to load phase config from ${filePath}`);
      // console.log(`loadOrder: unable to load phase config from ${filePath}`, e);
    }
  }

  createPhase(folderPath: string): IPhase {
    return new FilePhase(folderPath, { phases: this });
  }

  validateFolders(folders: any) {
    if (!folders) {
      throw new Error(
        `loadPhases: No phases folders found for ${this.phasesPath}`
      );
    }
    if (folders.length == 0) {
      this.log(`loadPhases: No phase folders found for ${this.phasesPath}`);
    }
  }

  async loadPhases() {
    if (this.phases.length > 0) return;
    this.log('loading phases');
    await this.loadConfig();
    const folders = this.handler.foldersFrom(this.phasesPath);
    this.validateFolders(folders);
    for (const folderPath of folders) {
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
