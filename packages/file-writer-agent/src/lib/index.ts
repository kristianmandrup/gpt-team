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
  sendStatusMsg?: SendMsgFn;
  sendDeliverableMsg?: SendMsgFn;

  constructor(opts: AIMsgBusAgentParams) {
    super(opts);
    this.basePath = path.join(process.cwd(), 'agents', 'api-agent', 'db');
  }

  get workspace(): any {
    return {};
  }

  override createOnMessage({ channel }: { channel: amqp.Channel }): OnMessage {
    return async (message: amqp.ConsumeMessage | null) => {
      if (!message) return;
      const body = JSON.parse(message.content.toString());

      // Use the message to extract file info and write to file system
      const text = body.message;

      const files = parseChat(text);
      filesToFileSystem(this.workspace, files, body.meta);
      const filePaths = {
        fileX: 'x.y',
      };

      const deliverableMsg = JSON.stringify(filePaths);
      const statusMsg = 'files written to fs';
      const meta = {
        files,
      };
      const { sendDeliverableMsg, sendStatusMsg } = this;

      sendDeliverableMsg &&
        (await sendDeliverableMsg({ messages: [deliverableMsg], meta }));

      // send output returned from step to UI channel
      sendStatusMsg && (await sendStatusMsg({ messages: [statusMsg], meta }));
      // Acknowledge the message to remove it from the queue
      channel.ack(message);
    };
  }

  async configureSendDeliverables() {
    await this.verifyQueue(queueNames.deliverables);

    this.sendStatusMsg = createSend(
      this.channel,
      queueNames.status,
      'fs-writer'
    ).bind(this);

    // send status about file written
    this.sendDeliverableMsg = createSend(
      this.channel,
      queueNames.deliverables,
      'fs-writer'
    ).bind(this);
  }

  override async processQueues() {
    this.configureSendDeliverables();
    const channel = this.channel?.getRawChannel();
    if (!channel) return;
    const onMessage = this.createOnMessage({ channel }).bind(this);
    // consume messages sent to all
    channel.consume(queueNames.all, onMessage);
  }
}
