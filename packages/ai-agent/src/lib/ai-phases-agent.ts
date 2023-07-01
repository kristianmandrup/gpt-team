import { DBs } from '@gpt-team/agent-storage';
import { Channel, createConsumer, MessageBus } from '@gpt-team/channel';
import type { IAiAndUserRunner } from '@gpt-team/ai';
import type { IPhases, IPhase, IPhaseTask } from '@gpt-team/phases';
import * as amqp from 'amqplib';
import { ConsumeMessage } from 'amqplib';
import { IAIAgent, TeamProps } from './types';

export class AIPhasesAgent implements IAIAgent {
  dbs?: DBs;
  msgBus: MessageBus;
  connection?: amqp.Connection;
  channel?: Channel;
  phases: IPhases;
  phase?: IPhase;
  task?: IPhaseTask;
  team: TeamProps;
  runner?: IAiAndUserRunner;

  protected terminationMsgs = ['COMPLETED', 'TERMINATED'];

  constructor(opts: { msgBus: MessageBus; phases: IPhases; team: TeamProps }) {
    const { phases, team, msgBus } = opts;
    this.phases = phases;
    this.team = team;
    this.msgBus = msgBus;
  }

  setRunner(runner: IAiAndUserRunner) {
    this.runner = runner;
    return this;
  }

  setDbs(dbs: DBs) {
    this.dbs = dbs;
    return this;
  }

  setMessageBus(msgBus: MessageBus) {
    this.msgBus = msgBus;
    return this;
  }

  get rawChannel() {
    return this.channel?.getRawChannel();
  }

  async init() {
    this.connection = await this.msgBus?.connect();
    this.channel = await this.msgBus?.getChannel();
    return this;
  }

  async start(phases: IPhases) {
    this.phases = phases;
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

  async getSubscriptions() {
    const config = await this.getConfig();
    const { subscribe } = config.channels || {};
    return subscribe;
  }

  async run() {
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

  async verifyQueue(queueName: string) {
    await this.rawChannel?.assertQueue(queueName);
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
      const QueueNamesToSubscribeTo = await this.getSubscriptions();
      const { channel, task } = this;
      // from config.yaml in task folder
      for (const queueName of QueueNamesToSubscribeTo) {
        const consume = this.createConsumer({ channel, task });
        await this.verifyQueue(queueName);
        // create subscription
        this.channel?.consume(queueName, consume);
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  createConsumer({ channel, task }: any) {
    return createConsumer({ channel, task });
  }

  protected isTeamDone({ body }: any) {
    return (
      this.terminationMsgs.includes(body.message) &&
      body.sender == this.team.name
    );
  }

  async stopWhenDone() {
    if (!this.channel) return;
    this.channel.consume('status', async (cmsg: ConsumeMessage | null) => {
      if (!cmsg) return;
      const body = await this.channel?.parseMsg(cmsg);

      if (this.isTeamDone({ body })) {
        this.phases.setDone();
      }
    });
  }

  async close() {
    this.rawChannel && (await this.rawChannel.close());
    this.connection && (await this.connection.close());
  }
}
