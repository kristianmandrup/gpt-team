import { IPhase, IPhaseTask } from '../types';

export class YamlPhaseTask implements IPhaseTask {
  protected taskConfig: any = {};
  protected messages: string[] = [];
  protected done = false;
  protected phase?: IPhase;

  isDone(): boolean {
    return this.done;
  }

  get name(): string {
    return this.taskConfig.name;
  }

  async getConfig(): Promise<Record<string, any>> {
    return this.taskConfig.config;
  }

  async getSubscriptionNames(): Promise<string[]> {
    const config = await this.getConfig();
    const { subscriptions } = config['channels'] || {};
    return subscriptions || [];
  }

  constructor(taskConfig: any, phase: IPhase) {
    this.phase = phase;
    this.taskConfig = taskConfig;
  }

  getPhase(): IPhase | undefined {
    return this.phase;
  }

  async loadMessages() {
    this.messages = this.taskConfig.messages;
  }

  async nextMessage() {
    await this.loadMessages();
    const msg = this.messages.shift();
    if (!msg) {
      this.done = true;
    }
    return msg;
  }
}
