import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { IPhase, IPhaseTask } from '../types';
import { FilePhaseHandler } from './file-phase-handler';

// such as use-cases
export class FilePhaseTask extends FilePhaseHandler implements IPhaseTask {
  private folderPath: string;
  private messages: string[] = [];
  private config: any;
  private done = false;
  private phase?: IPhase;

  isDone(): boolean {
    return this.done;
  }

  get name(): string {
    return path.parse(this.folderPath).name;
  }

  constructor(folderPath: string, phase?: IPhase) {
    super();
    this.phase = phase;
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
  override fileFilter(file: string) {
    return this.indexof(file) >= 0;
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
        return this.indexof(f1) <= this.indexof(f2) ? 1 : 0;
      });
      for (const filePath of sortedFiles) {
        const message = await this.loadMsgFile(filePath);
        if (!message) continue;
        this.messages.push(message);
      }
    } catch (_) {
      console.log('loadMessages: Failed to load messages');
      return;
    }
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
