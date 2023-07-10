import { BasePhaseTask } from '../base';
import { IPhase, IPhaseTask, IPhaseTaskOptionParams } from '../types';
import { loadYamlFile } from './yaml-handler';

export class YamlPhaseTask extends BasePhaseTask implements IPhaseTask {
  protected configFile?: string
  protected loaded = false


  constructor(config: any, opts: IPhaseTaskOptionParams) {
    super(opts);
    this.config = config;
    this.configFile = config.configFile
  }

  async getConfig(): Promise<Record<string, any>> {
    await this.loadFromConfigFile()
    return this.config;
  }

  async loadFromConfigFile(filePath?: string) {
    if (this.loaded) return
    try {
      filePath= filePath || this.configFile
      if (!filePath) return
      const config: any = await loadYamlFile(filePath);
      if (!config) return;
      this.config = {
        ...this.config,
        ...config
      }
      this.parseConfig()
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
