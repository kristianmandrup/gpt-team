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

  getName(): string {
    return path.parse(this.folderPath).name;
  }

  constructor(folderPath: string, opts: IPhaseTaskOptionParams) {
    super(opts);
    this.handler = new FilePhaseHandler();
    this.folderPath = folderPath;
  }

  async getConfig() {
    await this.loadConfig();
    return this.config;
  }

  getPhase() {
    return this.phase;
  }

  // TODO: only txt and md files
  fileFilter(file: string) {
    return this.handler.indexof(file) >= 0;
  }

  async loadConfig() {
    if (this.config) return;
    const configPath = path.join(this.folderPath, 'config.yml');
    try {
      const file = fs.readFileSync(configPath, 'utf8');
      const doc = yaml.load(file);
      this.config = doc;
    } catch (e) {
      console.log(e);
    }
  }

  async loadMsgFile(filePath: string) {
    const fullFilePath = path.join(this.folderPath, filePath);
    try {
      return fs.readFileSync(fullFilePath, 'utf8');
    } catch (e) {
      console.log(e);
      return;
    }
  }

  async loadMessages() {
    try {
      if (this.messages.length > 0) return;
      const files = fs.readdirSync(this.folderPath);
      const useFiles = files.filter((f) => this.fileFilter(f));
      const sortedFiles = useFiles.sort((f1: string, f2: string) => {
        return this.handler.indexof(f1) <= this.handler.indexof(f2) ? 1 : 0;
      });
      for (const filePath of sortedFiles) {
        const message = await this.loadMsgFile(filePath);
        if (!message) continue;
        this.addMessage(message);
      }
    } catch (_) {
      console.log('loadMessages: Failed to load messages');
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
