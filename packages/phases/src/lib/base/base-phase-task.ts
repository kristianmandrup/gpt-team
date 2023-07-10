import { ListHandler } from '../list-handler';
import {
  IPhase,
  IPhaseTask,
  IPhaseTaskOptionParams,
  PhaseTaskCallbacks,
} from '../types';

export abstract class BasePhaseTask implements IPhaseTask {
  protected config: any;
  protected callbacks?: PhaseTaskCallbacks;
  protected messages: string[] = [];
  protected phase?: IPhase;
  protected current?: IPhaseTask;
  protected done = false;
  protected goal?: string;
  protected role?: string;
  protected name = 'noname';
  protected loggingOn = false;
  protected ordering = [];
  protected ignored = [];
  protected channels = {};
  protected subscriptions = [];
  protected recipients = [];
  protected listHandler?: ListHandler;

  constructor({ loggingOn, phase, callbacks }: IPhaseTaskOptionParams) {
    this.callbacks = callbacks;
    this.phase = phase;
    this.loggingOn = Boolean(loggingOn);
  }

  createListHandler(config: any) {
    return new ListHandler(config);
  }

  validateList(list: any, label: string) {
    if (list && !Array.isArray(list)) {
      throw new Error(
        `${label} entry must contain an Array of phase task names`
      );
    }
  }

  parseOrderAndIgnore(config: any) {
    // order
    const order = config['order'];
    this.validateList(order, 'order');
    this.ordering = order || [];
    // ignore
    const ignore = config['ignore'];
    this.validateList(ignore, 'ignore');
    this.ignored = ignore || [];
  }

  parseConfig() {
    const channels = this.config['channels'] || {};
    const name = this.config['name'];
    const goal = this.config['goal'];
    const role = this.config['role'];
    this.channels = channels;
    const { subscriptions, recipients } = channels;
    this.subscriptions = subscriptions;
    this.recipients = recipients;
    this.name = name;
    this.goal = this.goal || goal;
    this.role = this.role || role;
  }

  getName(): string {
    return this.name;
  }

  getRecipients(): string[] {
    return this.recipients;
  }

  getSubscriptions(): string[] {
    return this.subscriptions;
  }

  log(msg: string) {
    if (!this.loggingOn) return;
    console.log(msg);
  }

  addMessage(message: string) {
    this.messages.push(message);
  }

  getParentGoal() {
    return this.phase?.getGoal && this.phase?.getGoal();
  }

  getGoal() {
    return this.goal;
  }

  getParentRole() {
    return this.phase?.getRole && this.phase?.getRole();
  }

  getRole() {
    return this.role || this.getParentGoal();
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
