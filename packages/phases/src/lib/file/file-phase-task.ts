import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { IPhaseTask, IPhaseTaskOptionParams } from '../types';
import { FilePhaseHandler } from './file-phase-handler';
import { BasePhaseTask } from '../base/base-phase-task';

// such as use-cases
export class FilePhaseTask extends BasePhaseTask implements IPhaseTask {
  protected folderPath: string;
  protected handler = new FilePhaseHandler();
  protected taskFilePaths: string[] = [];
  public loadedConfig = false;
  protected goalPath: string;
  protected rolePath: string;

  constructor(folderPath: string, opts: IPhaseTaskOptionParams) {
    super(opts);
    this.handler = new FilePhaseHandler(opts);
    this.folderPath = folderPath;
    this.goalPath = path.join(folderPath, '_goal.md');
    this.rolePath = path.join(folderPath, '_role.md');
  }

  async loadRole() {
    if (this.role) return;
    try {
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

  async getConfig() {
    await this.loadAll();
    return this.config;
  }

  getPhase() {
    return this.phase;
  }

  readFiles(filePath: string) {
    return this.handler.readFiles(filePath);
  }

  indexOf(filePath: string) {
    return this.handler.indexOf(filePath);
  }

  async loadAll() {
    await this.loadConfig();
    await this.loadGoal();
    await this.loadRole();
  }

  async loadConfig() {
    if (this.loadedConfig) return;
    const configPath = path.join(this.folderPath, '_config.yml');
    try {
      this.log(`loadConfig: reading ${configPath}`);
      const file = fs.readFileSync(configPath, 'utf8');
      const doc: any = yaml.load(file);
      this.loadedConfig = true;
      this.config = doc;
      this.parseConfig();
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
      let taskFilePaths = this.getTaskFilePaths();
      this.listHandler = this.createListHandler({
        order: this.ordering,
        ignore: this.ignored,
      });
      taskFilePaths = this.listHandler.ordered(taskFilePaths);
      this.taskFilePaths = taskFilePaths;
      const group = this.listHandler.group(taskFilePaths);
      const pathToGroupMap = this.listHandler.invertedGroup(group);
      for (const filePath of taskFilePaths) {
        const message = await this.loadMsgFile(filePath);
        if (!message) continue;
        const name = path.parse(filePath).name;
        const groupName = pathToGroupMap[name];
        this.addMessageToGroup(groupName, message);
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

  addMessageToGroup(groupName: string, message: string) {
    if (groupName && message) {
      this.messageMap[groupName] = this.messageMap[groupName] || [];
      this.messageMap[groupName].push(message);
    }
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
      this.setCompleted();
    }
    return msg;
  }
}
