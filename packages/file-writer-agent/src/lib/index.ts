import * as amqp from 'amqplib';
import { parseChat, filesToFileSystem } from '@gpt-team/ai';
import {
  queueNames,
  createSend,
  OnMessage,
  MsgPayload,
} from '@gpt-team/channel';
import * as path from 'path';
import {
  AIMsgBusAgent,
  AIMsgBusAgentParams,
  type IAIMsgBusAgent,
} from '@gpt-team/ai-agent';

// Function to process project descriptions and generate use cases
export type SendMsgFn = (payload: MsgPayload) => Promise<void>;

export class FileWriterAgent extends AIMsgBusAgent implements IAIMsgBusAgent {
  basePath: string = process.cwd();
  send: Record<string, SendMsgFn> = {};
  sendQueues = ['deliverables', 'status'];

  constructor(opts: AIMsgBusAgentParams) {
    super(opts);
    this.basePath = path.join(process.cwd(), 'agents', 'api-agent', 'db');
  }

  get workspace(): any {
    return {};
  }

  parseMsg(message: amqp.ConsumeMessage) {
    const body = JSON.parse(message.content.toString());
    // Use the message to extract file info and write to file system
    return { content: body.message, body };
  }

  override createOnMessage(): OnMessage {
    return async (message: amqp.ConsumeMessage | null) => {
      if (!message) return;
      const { content, body } = this.parseMsg(message);
      const files = parseChat(content);
      const fileSys = filesToFileSystem(this.workspace, files, body.meta);
      const meta = {
        files,
      };
      this.sendMsg('deliverable', fileSys, meta);
      this.sendMsg('status', 'files written to fs', meta);

      // send output returned from step to UI channel
      this.acknowledgeMessage(message);
    };
  }

  acknowledgeMessage(message: amqp.ConsumeMessage) {
    const channel = this.channel?.getRawChannel();
    // Acknowledge the message to remove it from the queue
    channel && channel.ack(message);
  }

  async sendMsg(name: string, payload: any, meta: any) {
    const sendMsg = this.send[name];
    const msg = JSON.stringify(payload);
    sendMsg && (await sendMsg({ messages: [msg], meta }));
  }

  createPhaseSender(name: string) {
    return createSend(this.channel, queueNames[name], this.team.name).bind(
      this
    );
  }

  async configureSendMethods() {
    this.sendQueues.forEach(async (name) => {
      await this.verifyPhaseQueue(name);
      const sender = this.createPhaseSender('status');
      this.send[name] = sender;
    });
  }

  override async processQueues() {
    this.configureSendMethods();
    const channel = this.channel?.getRawChannel();
    if (!channel) return;
    const onMessage = this.createOnMessage().bind(this);
    // consume messages sent to all
    channel.consume(queueNames['all'], onMessage);
  }
}
