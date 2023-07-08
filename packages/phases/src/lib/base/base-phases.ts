import { IPhase, IPhaseTask, IPhases, PhasesCallbacks } from '../types';

export abstract class BasePhases implements IPhases {
  protected phases: IPhase[] = [];
  protected currentPhase?: IPhase;
  protected currentTask?: IPhaseTask;
  protected done = false;
  protected callbacks?: PhasesCallbacks;

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

  onTaskCompleted(task: IPhaseTask) {
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
