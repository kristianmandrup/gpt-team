import {
  IPhase,
  IPhaseOptionParams,
  IPhaseTask,
  IPhases,
  PhaseCallbacks,
} from '../types';

export abstract class BasePhase implements IPhase {
  protected phases?: IPhases;
  protected tasks: IPhaseTask[] = [];
  protected currentTask?: IPhaseTask;
  protected done = false;
  protected callbacks?: PhaseCallbacks;
  protected goal = '';
  protected loggingOn = false;
  protected name = 'noname';

  constructor({ loggingOn, phases, callbacks }: IPhaseOptionParams) {
    this.callbacks = callbacks;
    this.phases = phases;
    this.loggingOn = Boolean(loggingOn);
  }

  log(msg: string) {
    if (!this.loggingOn) return;
    console.log(msg);
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

  onTaskDone(task: IPhaseTask) {
    this.phases?.onTaskDone && this.phases?.onTaskDone(task);
  }

  async nextTask() {
    if (this.isDone()) return;
    if (!this.currentTask) {
      this.setCompleted();
      return;
    }
    this.currentTask = this.tasks.shift();
    return this.currentTask;
  }
}
