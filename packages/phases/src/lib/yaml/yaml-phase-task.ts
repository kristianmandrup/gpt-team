import * as path from 'path';
import { BasePhaseTask } from '../base';
import { IPhase, IPhaseTask, IPhaseTaskOptionParams } from '../types';
import { loadYamlFile } from './yaml-handler';

export class YamlPhaseTask extends BasePhaseTask implements IPhaseTask {
  protected basePath: string;
  protected parentLocation?: string;
  protected fullBasePath?: string;
  protected configFile?: string;
  protected loaded = false;

  constructor(config: any, opts: IPhaseTaskOptionParams = {}) {
    super(opts);
    const meta = opts.meta || {};
    const { basePath, location } = meta;
    this.basePath = basePath;
    this.parentLocation = location;
    this.fullBasePath = location ? path.join(basePath, location) : basePath;
    this.config = config;
    this.configFile = config.configFile;
  }

  async getConfig(): Promise<Record<string, any>> {
    await this.loadFromConfigFile();
    return this.config;
  }

  async loadFromConfigFile(filePath?: string) {
    if (this.loaded) return;
    try {
      filePath = filePath || this.configFile;
      if (!filePath) return;
      const fullFilePath = this.fullBasePath
        ? path.join(this.fullBasePath, filePath)
        : filePath;
      this.log(`loadFromConfigFile: loading from ${fullFilePath}`);
      const config: any = await loadYamlFile(fullFilePath);
      if (!config) return;
      this.config = {
        ...this.config,
        ...config,
      };
      this.parseConfig();
      this.loaded = true;
    } catch (e) {
      this.log(`loadYamlFile: error loading file ${filePath}`);
      this.loaded = true;
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
