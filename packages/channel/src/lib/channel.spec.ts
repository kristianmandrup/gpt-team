import * as amqp from 'amqplib';
import { Channel } from './channel';

describe.skip('channel', () => {
  const rabbitmqUrl = 'amqp://localhost';
  let channel: Channel;

  beforeAll(async () => {
    const connection = await amqp.connect(rabbitmqUrl);
    const chn = await connection.createChannel();
    channel = new Channel(chn);
  });

  it('should work', () => {
    expect(channel).toBeDefined();
  });
});
