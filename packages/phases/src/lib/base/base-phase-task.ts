import {
  IPhase,
  IPhaseTask,
  IPhaseTaskOptionParams,
  PhaseTaskCallbacks,
} from '../types';

export abstract class BasePhaseTask implements IPhaseTask {
  protected messages: string[] = [];
  protected phase?: IPhase;
  protected current?: IPhaseTask;
  protected done = false;
  protected callbacks?: PhaseTaskCallbacks;
  protected goal = '';
  public name = 'noname';

  constructor({ phase, callbacks }: IPhaseTaskOptionParams) {
    this.callbacks = callbacks;
    this.phase = phase;
  }

  addMessage(message: string) {
    this.messages.push(message);
  }

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

  async nextMessage() {
    if (this.isDone()) return;
    if (!this.current) {
      this.setCompleted();
      return;
    }
    return this.messages.shift();
  }
}
