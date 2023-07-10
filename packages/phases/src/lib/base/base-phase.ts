import { ListHandler } from '../list-handler';
import {
  IPhase,
  IPhaseOptionParams,
  IPhaseTask,
  IPhases,
  PhaseCallbacks,
} from '../types';

export abstract class BasePhase implements IPhase {
  protected config: any = {};
  protected phases?: IPhases;
  protected tasks: IPhaseTask[] = [];
  protected currentTask?: IPhaseTask;
  protected done = false;
  protected callbacks?: PhaseCallbacks;
  protected goal?: string;
  protected role?: string;
  protected loggingOn = false;
  protected name = 'noname';
  protected listHandler?: ListHandler;

  constructor({ loggingOn, phases, callbacks }: IPhaseOptionParams) {
    this.callbacks = callbacks;
    this.phases = phases;
    this.loggingOn = Boolean(loggingOn);
  }

  createListHandler(config: any) {
    return new ListHandler(config);
  }

  log(msg: string) {
    if (!this.loggingOn) return;
    console.log(msg);
  }

  getGoal() {
    return this.goal;
  }

  getRole() {
    return this.role;
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
