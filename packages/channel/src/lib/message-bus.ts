import * as amqp from 'amqplib';

export class MessageBus {
  private url: string;
  private connection: amqp.Connection;

  constructor(url: string) {
    this.url = url;
  }

  async connect() {
    this.connection = await amqp.connect(this.url);
    return this.connection;
  }

  getChannel = async () => {
    const channel = await this.connection.createChannel();
    return new Channel(channel);
  };
}
