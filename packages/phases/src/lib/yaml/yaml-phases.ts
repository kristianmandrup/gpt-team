import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { IPhase, IPhases } from '../types';
import { YamlPhase } from './yaml-phase';

export const loadYamlFile = async (filePath: string) => {
  try {
    const file = fs.readFileSync(filePath, 'utf8');
    return yaml.load(file);
  } catch (e) {
    console.log(e);
    return;
  }
};

export class YamlPhases implements IPhases {
  private phases: IPhase[] = [];
  private currentPhase?: IPhase;
  private basePath: string;
  private phasesPath: string;
  private done = false;

  isDone(): boolean {
    return this.done;
  }

  setDone() {
    this.done = true;
  }

  constructor(basePath: string) {
    this.basePath = basePath;
    this.phasesPath = path.join(this.basePath, 'phases.yaml');
  }

  createPhase(config: any) {
    return new YamlPhase(config);
  }

  async loadPhases() {
    const config: any = await loadYamlFile(this.phasesPath);
    if (!config) return;
    const { phases } = config;
    if (!phases) {
      console.log('Missing phases in config');
      return;
    }
    for (const config in phases as any[]) {
      const phase = this.createPhase(config);
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
