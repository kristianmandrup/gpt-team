import { DBs } from '@gpt-team/agent-storage';
import {
  Channel,
  createConsumer,
  createSend,
  MessageBus,
  OnMessage,
  queueNames,
} from '@gpt-team/channel';
import type { IAiAndUserRunner } from '@gpt-team/ai';
import type { IPhases, IPhase, IPhaseTask } from '@gpt-team/phases';
import * as amqp from 'amqplib';
import { ConsumeMessage } from 'amqplib';
import { IAIPhasesAgent, TeamProps } from './types';
import { AIMsgBusAgent } from './ai-msgbus-agent';

export class AIPhasesAgent extends AIMsgBusAgent implements IAIPhasesAgent {
  dbs?: DBs;
  phases: IPhases;
  phase?: IPhase;
  task?: IPhaseTask;
  runner?: IAiAndUserRunner;

  constructor(opts: { msgBus: MessageBus; phases: IPhases; team: TeamProps }) {
    super(opts);
    const { phases } = opts;
    this.phases = phases;
  }

  setRunner(runner: IAiAndUserRunner) {
    this.runner = runner;
    return this;
  }

  setDbs(dbs: DBs) {
    this.dbs = dbs;
    return this;
  }

  override async init() {
    this.connection = await this.msgBus?.connect();
    this.channel = await this.msgBus?.getChannel();
    return this;
  }

  override async start() {
    console.log('Agent is waiting for messages...');
  }

  async nextPhase() {
    this.phase = await this.phases.nextPhase();
    return this.phase;
  }

  async nextTask() {
    this.task = await this.phases.nextTask();
    return this.task;
  }

  async getConfig() {
    return this.task?.getConfig ? await this.task.getConfig() : {};
  }

  override async getSubscriptions() {
    const config = await this.getConfig();
    const { subscribe } = config.channels || {};
    return subscribe;
  }

  override async run() {
    await this.runPhases();
  }

  async runPhases() {
    try {
      await this.init();
      while (!this.phases.isDone()) {
        await this.runPhase();
      }
      await this.close();
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  async verifyPhaseQueue(name: string) {
    await this.verifyQueue(queueNames[name]);
  }

  createPhaseSender(name: string) {
    return this.createSender(queueNames[name]);
  }

  async runPhase() {
    if (!this.phase) {
      throw new Error(`No phase set`);
    }
    try {
      await this.nextTask();
      if (this.phase?.isDone()) {
        await this.nextPhase();
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  override async consumeQueues(onMessage: OnMessage) {
    const QueueNamesToSubscribeTo = await this.getSubscriptions();
    const { channel, task } = this;
    // from config.yaml in task folder
    for (const queueName of QueueNamesToSubscribeTo) {
      const consume = this.createConsumer({ channel, task });
      await this.verifyQueue(queueName);
      // create subscription
      this.channel?.consume(queueName, consume);
    }
  }

  createConsumer({ channel, task }: any) {
    return createConsumer({ channel, task });
  }

  override async stopWhenDone() {
    if (!this.channel) return;
    this.channel.consume('status', async (cmsg: ConsumeMessage | null) => {
      if (!cmsg) return;
      const body = await this.channel?.parseMsg(cmsg);

      if (this.isTeamDone({ body })) {
        this.phases.setDone();
      }
    });
  }
}
