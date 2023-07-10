import * as path from 'path';
import { IPhase, IPhases, IPhasesOptionParams } from '../types';
import { YamlPhase } from './yaml-phase';
import { BasePhases } from '../base';
import { YamlHandler, loadYamlFile } from './yaml-handler';

export class YamlPhases extends BasePhases implements IPhases {
  protected basePath: string;
  protected phasesPath: string;
  protected handler?: YamlHandler
  protected location?: string

  constructor(basePath: string, opts: IPhasesOptionParams = {}) {
    super(opts);
    this.basePath = basePath;
    this.phasesPath = path.join(this.basePath, 'phases.yaml');
  }

  createPhase(config: any) {
    const meta = {
      location: this.location
    }
    return new YamlPhase(config, { meta, phases: this });
  }

  validatePhasesConfigs(phaseConfigs: any) {
    if (!phaseConfigs) {
      this.log('Missing phases in config');
      throw new Error("Missing phases in config")
    }
  }

  createHandler(config: any) {
    return new YamlHandler(config)
  }

  async loadPhases() {
    this.log('loadPhases: loading');
    let phaseConfigs: any;
    const filePath = this.phasesPath;
    try {
      const config: any = await loadYamlFile(filePath);
      if (!config) return;
      phaseConfigs = config['phases'];
      this.validatePhasesConfigs(phaseConfigs)      
      this.location = config['location']
      this.handler = this.createHandler(config)
    } catch (e) {
      this.log(`loadYamlFile: error loading file ${filePath}`);
      return;
    }
    // add key as name to each phase, ignore then order list
    phaseConfigs = this.handler.prepare(phaseConfigs)
    this.iterate(phaseConfigs)
    this.log('loadPhases: loaded');
  }

  iterate(phaseConfigs: any) {
    phaseConfigs.map((phaseConfig: any) => {
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
