import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { IPhaseTask, IPhaseTaskOptionParams } from '../types';
import { FilePhaseHandler } from './file-phase-handler';
import { BasePhaseTask } from '../base/base-phase-task';

// such as use-cases
export class FilePhaseTask extends BasePhaseTask implements IPhaseTask {
  protected folderPath: string;
  protected config: any;
  protected handler = new FilePhaseHandler();
  protected taskFilePaths: string[] = [];
  public loadedConfig = false;
  protected goalPath: string;

  getName(): string {
    return path.parse(this.folderPath).name;
  }

  constructor(folderPath: string, opts: IPhaseTaskOptionParams) {
    super(opts);
    new FilePhaseHandler(opts);
    this.folderPath = folderPath;
    this.goalPath = path.join(folderPath, '_goal.md');
  }

  async loadGoal() {
    if (this.goal) return;
    const doc = fs.readFileSync(this.goalPath, 'utf-8');
    this.goal = doc;
  }

  async getConfig() {
    await this.loadConfig();
    return this.config;
  }

  getPhase() {
    return this.phase;
  }

  set ordering(order: any) {
    this.handler.ordering = order;
  }

  get ordering() {
    return this.handler.ordering;
  }

  readFiles(filePath: string) {
    return this.handler.readFiles(filePath);
  }

  indexOf(filePath: string) {
    return this.handler.indexOf(filePath);
  }

  async loadConfig() {
    if (this.loadedConfig) return;
    const configPath = path.join(this.folderPath, '_config.yml');
    try {
      console.log('loadConfig: reading', configPath);
      const file = fs.readFileSync(configPath, 'utf8');
      const doc: any = yaml.load(file);
      this.loadedConfig = true;
      this.config = doc;
      const order = doc['order'];
      if (!order) {
        throw new Error(
          `loadConfig: config file ${configPath} missing 'order' entry`
        );
      }
      if (!Array.isArray(order)) {
        throw new Error(
          `loadOrder: loading order from 'order' entry in ${configPath}, the entry must contain an Array of ordered phase task names`
        );
      }
      this.ordering = order;
    } catch (e) {
      console.log(e);
    }
  }

  async loadMsgFile(filePath: string) {
    try {
      console.log('loadMsgFile: reading', filePath);
      return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      console.log(e);
      return;
    }
  }

  getTaskFilePaths() {
    const taskFilePaths = this.handler.readFiles(this.folderPath);
    if (this.ordering.length == 0) return taskFilePaths;
    return taskFilePaths.sort((f1: string, f2: string) => {
      return this.indexOf(f1) <= this.indexOf(f2) ? 1 : 0;
    });
  }

  async loadMessages() {
    try {
      if (this.messages.length > 0) return;
      // includes loading task order
      await this.loadConfig();
      const taskFilePaths = this.getTaskFilePaths();
      this.taskFilePaths = taskFilePaths;
      for (const filePath of taskFilePaths) {
        const message = await this.loadMsgFile(filePath);
        if (!message) continue;
        this.addMessage(message);
      }
    } catch (e) {
      console.log(
        `loadMessages: Failed to load messages from ${this.folderPath}`,
        e
      );
      return;
    }
  }

  override async nextMessage() {
    await this.loadMessages();
    const msg = this.messages.shift();
    if (!msg) {
      this.setCompleted();
    }
    return msg;
  }
}
