import * as fs from 'fs';
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
  protected goalPath?: string;
  protected rolePath?: string;

  constructor(config: any, opts: IPhaseTaskOptionParams = {}) {
    super(opts);
    const meta = opts.meta || {};
    const { basePath, location } = meta;
    this.basePath = basePath;
    this.parentLocation = location;
    this.fullBasePath = location ? path.join(basePath, location) : basePath;
    this.goalPath = this.fullBasePath
      ? path.join(this.fullBasePath, '_goal.md')
      : undefined;
    this.config = config;
    this.rolePath = this.fullBasePath
      ? path.join(this.fullBasePath, '_role.md')
      : undefined;
    this.config = config;

    this.configFile = config.configFile;
  }

  async getConfig(): Promise<Record<string, any>> {
    await this.loadAll();
    return this.config;
  }

  async loadAll() {
    await this.loadGoal();
    await this.loadRole();
    await this.loadFromConfigFile();
  }

  async loadRole() {
    if (this.role) return;
    try {
      if (!this.rolePath) return;
      const doc = fs.readFileSync(this.rolePath, 'utf-8');
      this.role = doc;
    } catch (_) {
      this.log('no role file found');
    }
  }
  async loadGoal() {
    if (this.goal) return;
    try {
      if (!this.goalPath) return;
      const doc = fs.readFileSync(this.goalPath, 'utf-8');
      this.goal = doc;
    } catch (e) {
      console.log(`loadGoal: unable to load goal file from ${this.goalPath}`);
    }
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
    if (Array.isArray(messages)) {
      this.messages = messages;
    } else {
      this.messageMap = messages;
    }
    this.log('loadMessages: loaded');
  }

  override async nextMessageOf(type: string) {
    await this.loadMessages();
    if (!this.messageMap[type]) {
      return;
    }
    const msg = this.messageMap[type].shift();
    return msg;
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
