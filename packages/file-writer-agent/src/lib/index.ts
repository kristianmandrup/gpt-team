import * as amqp from 'amqplib';
import { parseChat, filesToFileSystem } from '@gpt-team/ai';
import { queueNames, createSend } from '@gpt-team/channel';
import { createDbs } from './dbs';
import * as path from 'path';
import type { IAIAgent } from '@gpt-team/ai-agent';

// Function to process project descriptions and generate use cases

export class FileWriterAgent implements IAIAgent {
  async run() {
    // Db
    const basePath = path.join(process.cwd(), 'agents', 'api-agent', 'db');
    const dbs = createDbs(basePath);

    // RabbitMQ connection URL
    const rabbitmqUrl = 'amqp://localhost';

    try {
      // Connect to RabbitMQ
      const connection = await amqp.connect(rabbitmqUrl);
      const channel = await connection.createChannel();

      // Ensure the queue exists
      await channel.assertQueue(queueNames.deliverables);

      const sendMsg = createSend(channel, queueNames.status, 'fs-writer');

      console.log('FS write Agent is waiting for deliverables...');

      // Consume messages from the queue
      channel.consume(queueNames.all, async (message: any) => {
        const body = JSON.parse(message.content.toString());

        // Use the message to extract file info and write to file system

        const text = body.message;

        const files = parseChat(text);
        filesToFileSystem(dbs.workspace, files, body.meta);

        const msg = 'files written to fs';
        const meta = {
          files,
        };
        // send output returned from step to UI channel
        await sendMsg({ messages: [msg], meta });
        // Acknowledge the message to remove it from the queue
        channel.ack(message);
      });

      // Close the RabbitMQ connection
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }
}
