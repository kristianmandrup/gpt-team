import { BasePhaseTask } from '../base';
import { IPhase, IPhaseTask, IPhaseTaskOptionParams } from '../types';

export class YamlPhaseTask extends BasePhaseTask implements IPhaseTask {
  protected taskConfig: any = {};

  getName(): string {
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

  constructor(taskConfig: any, opts: IPhaseTaskOptionParams) {
    super(opts);
    this.taskConfig = taskConfig;
  }

  getPhase(): IPhase | undefined {
    return this.phase;
  }

  async loadMessages() {
    this.messages = this.taskConfig.messages;
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
