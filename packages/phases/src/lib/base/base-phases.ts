import {
  IPhase,
  IPhaseTask,
  IPhases,
  IPhasesOptionParams,
  PhasesCallbacks,
} from '../types';

export abstract class BasePhases implements IPhases {
  protected phases: IPhase[] = [];
  protected currentPhase?: IPhase;
  protected currentTask?: IPhaseTask;
  protected done = false;
  protected callbacks?: PhasesCallbacks;
  protected loggingOn = false;

  constructor({ callbacks, loggingOn }: IPhasesOptionParams) {
    this.callbacks = callbacks;
    this.loggingOn = Boolean(loggingOn);
  }

  log(msg: string) {
    if (!this.loggingOn) return;
    console.log(msg);
  }

  isDone(): boolean {
    return this.done;
  }

  setDone() {
    this.done = true;
  }

  setCompleted() {
    this.done = true;
    this.callbacks?.onDone && this.callbacks?.onDone(this);
  }

  onTaskDone(task: IPhaseTask) {
    this.callbacks?.onTaskDone && this.callbacks?.onTaskDone(task);
  }

  async nextPhase() {
    this.currentPhase = this.phases.shift();
    if (!this.currentPhase) {
      this.setCompleted();
      return;
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
