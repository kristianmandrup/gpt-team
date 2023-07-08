import { IPhase, IPhaseTask, PhaseCallbacks } from '../types';

export abstract class BasePhase implements IPhase {
  protected tasks: IPhaseTask[] = [];
  protected current?: IPhaseTask;
  protected done = false;
  protected callbacks?: PhaseCallbacks;
  protected goal = '';
  public name = 'noname';

  getGoal(): string {
    return this.goal;
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

  async nextTask() {
    if (this.isDone()) return;
    if (!this.current) {
      this.setCompleted();
      return;
    }
    return this.tasks.shift();
  }
}
