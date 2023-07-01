import * as amqp from 'amqplib';
import { createSend } from './send';
import { parseMsg } from './parse';

export const getChannel = async (rabbitmqUrl: string) => {
  const connection = await amqp.connect(rabbitmqUrl);
  return await connection.createChannel();
};

export type OnMessage = (msg: amqp.ConsumeMessage | null) => void;

export class Channel {
  channel: amqp.Channel;

  constructor(channel: amqp.Channel) {
    this.channel = channel;
  }

  getRawChannel() {
    return this.channel;
  }

  createSend(channel: any, queueName: string, sender: string) {
    return createSend(channel, queueName, sender);
  }

  async assertExists(name: string, opts: amqp.Options.AssertQueue) {
    await this.channel.assertQueue(name, opts);
  }

  async consume(
    name: string,
    onMessage: OnMessage,
    options?: amqp.Options.Consume
  ) {
    return await this.channel.consume(name, onMessage, options);
  }

  parseMsg(message: amqp.ConsumeMessage) {
    return parseMsg(message);
  }
}
