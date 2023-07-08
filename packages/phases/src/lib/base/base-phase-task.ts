import {
  IPhase,
  IPhaseTask,
  IPhaseTaskOptionParams,
  PhaseTaskCallbacks,
} from '../types';

export abstract class BasePhaseTask implements IPhaseTask {
  protected callbacks?: PhaseTaskCallbacks;
  protected messages: string[] = [];
  protected phase?: IPhase;
  protected current?: IPhaseTask;
  protected done = false;
  protected goal = '';
  protected name = 'noname';
  protected loggingOn = false;

  constructor({ loggingOn, phase, callbacks }: IPhaseTaskOptionParams) {
    this.callbacks = callbacks;
    this.phase = phase;
    this.loggingOn = Boolean(loggingOn);
  }

  log(msg: string) {
    if (!this.loggingOn) return;
    console.log(msg);
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
    this.phase?.onTaskDone && this.phase?.onTaskDone(this);
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
