import { BasePhaseTask } from '../base';
import { IPhase, IPhaseTask, IPhaseTaskOptionParams } from '../types';

export class YamlPhaseTask extends BasePhaseTask implements IPhaseTask {
  protected taskConfig: any = {};

  getName(): string {
    return this.taskConfig.name;
  }

  async getConfig(): Promise<Record<string, any>> {
    return this.taskConfig;
  }

  async getSubscriptionNames(): Promise<string[]> {
    const config = await this.getConfig();
    const { subscriptions } = config['channels'] || {};
    return subscriptions || [];
  }

  constructor(taskConfig: any, opts: IPhaseTaskOptionParams) {
    super(opts);
    this.taskConfig = taskConfig;
  }

  getPhase(): IPhase | undefined {
    return this.phase;
  }

  async loadMessages() {
    const config = await this.getConfig();
    this.log('loadMessages: loading');
    const messages = config['messages'];
    if (!messages) {
      throw new Error('loadMessages: task config missing messages');
    }
    this.messages = messages;
    this.log('loadMessages: loaded');
  }

  override async nextMessage() {
    await this.loadMessages();
    const msg = this.messages.shift();
    if (!msg) {
      this.done = true;
    }
    return msg;
  }
}
