import * as path from 'path';
import { IPhase, IPhases, IPhasesOptionParams } from '../types';
import { YamlPhase } from './yaml-phase';
import { BasePhases } from '../base';
import { loadYamlFile } from './yaml-handler';
import { ListHandler } from '../list-handler';
import { PhaseGroup } from '../phase-group';

export class YamlPhases extends BasePhases implements IPhases {
  protected basePath: string;
  protected phasesPath: string;
  protected listHandler?: ListHandler;
  protected location?: string;
  protected groups: string[][] = [];

  constructor(basePath: string, opts: IPhasesOptionParams = {}) {
    super(opts);
    this.basePath = basePath;
    this.phasesPath = path.join(this.basePath, 'phases.yaml');
  }

  createPhase(config: any) {
    const meta = {
      basePath: this.basePath,
      location: this.location,
    };
    return new YamlPhase(config, { meta, phases: this });
  }

  validatePhasesConfigs(phaseConfigs: any) {
    if (!phaseConfigs) {
      this.log('Missing phases in config');
      throw new Error('Missing phases in config');
    }
  }

  createListHandler(config: any) {
    return new ListHandler(config);
  }

  async loadPhases() {
    this.log('loadPhases: loading');
    let phaseConfigs: any;
    const filePath = this.phasesPath;
    try {
      const config: any = await loadYamlFile(filePath);
      if (!config) return;
      phaseConfigs = this.setPhaseConfig(config);
      this.location = config['location'];
      this.setGroups(config);
      this.listHandler = this.createListHandler(config);
    } catch (e) {
      this.log(`loadYamlFile: error loading file ${filePath}`);
      return;
    }
    // add key as name to each phase, ignore then order list
    phaseConfigs = this.listHandler.prepare(phaseConfigs);
    this.iterate(phaseConfigs);
    this.iterateGroups();
    this.log('loadPhases: loaded');
  }

  setPhaseConfig(config: any) {
    const phaseConfigs = config['phases'];
    this.validatePhasesConfigs(phaseConfigs);
    return phaseConfigs;
  }

  setGroups(config: any) {
    const groups = config['groups'];
    if (!groups) return;
    if (!Array.isArray(groups)) {
      throw new Error('Invalid groups entry');
    }
    this.groups = groups;
  }

  iterateGroups() {
    for (const group of this.groups) {
      const phaseGroup = new PhaseGroup();
      for (const config of group) {
        const phase = this.createPhase(config);
        phaseGroup.addPhase(phase);
      }
      this.phaseGroups.push(phaseGroup);
    }
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

  override async nextPhaseGroup() {
    await this.loadPhases();
    this.currentPhaseGroup = this.phaseGroups.shift();
    if (!this.currentPhaseGroup) {
      this.setCompleted();
    }
    return this.currentPhaseGroup;
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
