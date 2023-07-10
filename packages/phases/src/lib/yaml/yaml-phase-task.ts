import { BasePhaseTask } from '../base';
import { IPhase, IPhaseTask, IPhaseTaskOptionParams } from '../types';
import { loadYamlFile } from './yaml-handler';

export class YamlPhaseTask extends BasePhaseTask implements IPhaseTask {
  protected taskConfig: any = {};
  protected configFile?: string
  protected loaded = false

  constructor(taskConfig: any, opts: IPhaseTaskOptionParams) {
    super(opts);
    this.taskConfig = taskConfig;
    this.configFile = taskConfig.configFile
  }

  getName(): string {
    return this.taskConfig.name;
  }

  async getConfig(): Promise<Record<string, any>> {
    await this.loadFromConfigFile()
    return this.taskConfig;
  }

  async getSubscriptionNames(): Promise<string[]> {
    const config = await this.getConfig();
    const { subscriptions } = config['channels'] || {};
    return subscriptions || [];
  }

  async loadFromConfigFile(filePath?: string) {
    if (this.loaded) return
    try {
      filePath= filePath || this.configFile
      if (!filePath) return
      const config: any = await loadYamlFile(filePath);
      if (!config) return;
      this.taskConfig = {
        ...this.taskConfig,
        ...config
      }
      this.loaded = true
    } catch (e) {
      this.log(`loadYamlFile: error loading file ${filePath}`);
      this.loaded = true
      return;
    }
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
