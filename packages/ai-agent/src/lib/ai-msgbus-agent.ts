import {
  Channel,
  MessageBus,
  OnMessage,
  createSend,
  queueNames,
  MsgPayload,
} from '@gpt-team/channel';
import * as amqp from 'amqplib';
import { ConsumeMessage } from 'amqplib';
import { IAIAgent, TeamProps } from './types';

export type SendMsgFn = (payload: MsgPayload) => Promise<void>;
export type AIMsgBusAgentParams = { msgBus: MessageBus; team: TeamProps };

export class AIMsgBusAgent implements IAIAgent {
  msgBus: MessageBus;
  connection?: amqp.Connection;
  channel?: Channel;
  team: TeamProps;
  send: Record<string, SendMsgFn> = {};

  protected terminationMsgs = ['COMPLETED', 'TERMINATED'];

  getSendQueues(): string[] {
    return [];
  }

  constructor(opts: AIMsgBusAgentParams) {
    const { team, msgBus } = opts;
    this.team = team;
    this.msgBus = msgBus;
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

  async start() {
    await this.run();
  }

  async getSubscriptions() {
    return [];
  }

  createSender(name: string) {
    return createSend(this.channel, name, this.team.name).bind(this);
  }

  async configureSendMethods() {
    this.getSendQueues().forEach(async (name) => {
      await this.verifyQueue(name);
      const sender = this.createSender(name);
      this.send[name] = sender;
    });
  }

  async run() {
    try {
      await this.init();
      while (!this.isDone()) {
        await this.processQueues();
      }
      await this.close();
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  isDone() {
    return false;
  }

  async processQueues() {
    await this.consumeQueues(this.createOnMessage());
  }

  createOnMessage(opts: any = {}): OnMessage {
    return (msg: amqp.ConsumeMessage | null) => {
      console.log({ received: msg?.content });
    };
  }

  async verifyQueue(queueName: string) {
    await this.rawChannel?.assertQueue(queueName);
  }

  async consumeQueues(onMessage: OnMessage) {
    const QueueNamesToSubscribeTo = await this.getSubscriptions();
    // from config.yaml in task folder
    for (const queueName of QueueNamesToSubscribeTo) {
      await this.verifyQueue(queueName);
      // create subscription
      this.channel?.consume(queueName, onMessage);
    }
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
        await this.onDone();
      }
    });
  }

  async onDone() {
    return;
  }

  async close() {
    this.rawChannel && (await this.rawChannel.close());
    this.connection && (await this.connection.close());
  }
}
