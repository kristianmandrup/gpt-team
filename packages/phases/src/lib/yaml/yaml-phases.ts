import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { IPhase, IPhases, IPhasesOptionParams } from '../types';
import { YamlPhase } from './yaml-phase';
import { BasePhases } from '../base';

export const loadYamlFile = async (filePath: string) => {
  try {
    const file = fs.readFileSync(filePath, 'utf8');
    return yaml.load(file);
  } catch (e) {
    console.log(e);
    return;
  }
};

export class YamlPhases extends BasePhases implements IPhases {
  private basePath: string;
  private phasesPath: string;

  constructor(basePath: string, opts: IPhasesOptionParams = {}) {
    super(opts);
    this.basePath = basePath;
    this.phasesPath = path.join(this.basePath, 'phases.yaml');
  }

  createPhase(config: any) {
    return new YamlPhase(config, { phases: this });
  }

  async loadPhases() {
    const config: any = await loadYamlFile(this.phasesPath);
    if (!config) return;
    console.log('loadPhases', { config });
    const { phases } = config;
    if (!phases) {
      console.log('Missing phases in config');
      return;
    }
    Object.keys(phases).map((key) => {
      const phaseConfig: any = phases[key];
      phaseConfig.name = key;
      const phase = this.createPhase(phaseConfig);
      this.addPhase(phase);
    });
  }

  addPhase(phase: IPhase) {
    this.callbacks?.onPhaseAdded && this.callbacks?.onPhaseAdded(phase);
    this.phases.push(phase);
  }

  override async nextPhase() {
    await this.loadPhases();
    this.currentPhase = this.phases.shift();
    if (!this.currentPhase) {
      this.setCompleted();
    }
    return this.currentPhase;
  }
}
