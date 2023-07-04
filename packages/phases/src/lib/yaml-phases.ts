import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { IPhase, IPhaseTask, IPhases } from './types';

export const loadYamlFile = async (filePath: string) => {
  try {
    const file = fs.readFileSync(filePath, 'utf8');
    return yaml.load(file);
  } catch (e) {
    console.log(e);
  }
};

export class YamlPhases implements IPhases {
  private phases: IPhase[] = [];
  private currentPhase?: IPhase;
  private basePath: string;
  private phasesPath: string;
  private done = false;

  isDone(): boolean {
    return this.done;
  }

  setDone() {
    this.done = true;
  }

  constructor(basePath: string) {
    this.basePath = basePath;
    this.phasesPath = path.join(this.basePath, 'phases.yaml');
  }

  async loadPhases() {
    const config: any = await loadYamlFile(this.phasesPath);
    for (const phaseConfig in config.phases as any[]) {
      const phase = new YamlPhase(phaseConfig);
      this.phases.push(phase);
    }
  }

  async nextPhase() {
    await this.loadPhases();
    this.currentPhase = this.phases.shift();
    if (!this.currentPhase) {
      this.done = true;
    }
    return this.currentPhase;
  }

  async nextTask() {
    if (this.isDone()) return;
    if (!this.currentPhase) {
      this.nextPhase();
    }
    return this.currentPhase?.nextTask();
  }
}

export class YamlPhase implements IPhase {
  private goal = '';
  private done = false;
  private config: any = {};
  private tasks: IPhaseTask[] = [];

  isDone(): boolean {
    return this.done;
  }

  setDone(): void {
    this.done = true;
  }

  constructor(config: any) {
    this.config = config;
  }

  get name(): string {
    return this.config.name;
  }

  getGoal(): string {
    return this.goal;
  }

  async loadGoal() {
    this.goal = this.config.goal;
  }

  async loadTasks() {
    for (const taskConfig of this.config.tasks) {
      const task = new YamlPhaseTask(this, taskConfig);
      this.tasks.push(task);
    }
  }

  async nextTask() {
    await this.loadTasks();
    const task = this.tasks.shift();
    if (!task) {
      this.done = true;
    }
    return task;
  }
}

export class YamlPhaseTask implements IPhaseTask {
  private taskConfig: any = {};
  private messages: string[] = [];
  private done = false;
  private phase: IPhase;

  isDone(): boolean {
    return this.done;
  }

  get name(): string {
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

  constructor(phase: IPhase, taskConfig: any) {
    this.phase = phase;
    this.taskConfig = taskConfig;
  }

  getPhase(): IPhase {
    return this.phase;
  }

  async loadMessages() {
    this.messages = this.taskConfig.messages;
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
