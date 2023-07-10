import { IPhase } from './types';

export class PhaseGroup {
  phases: IPhase[] = [];

  addPhase(phase: IPhase) {
    this.phases.push(phase);
  }
}
