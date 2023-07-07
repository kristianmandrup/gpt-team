import type { OutputOpts } from '@gpt-team/packages/ai-adapter';
import { createSend } from './send';
import { parseMsg } from './parse';
import { queueNames } from './config';
import { ConsumeMessage } from 'amqplib';

export type ConsumerOpts = {
  channel: any;
  task: any;
  run?: any;
};

export const createConsumer =
  ({ channel, run, task }: ConsumerOpts) =>
  async (cmsg: ConsumeMessage | null) => {
    // OpenAI options
    const config = task.config || {};

    // TODO: use task config
    const { publish } = config.channels || {};
    const { input } = config;
    const output: OutputOpts = config.output;

    const body = await parseMsg(cmsg);
    const inputMsg = body.message;

    const inputs = [inputMsg, ...input];

    // TODO: send msgContent as initial input?
    const messages = await run({ inputs, output, task });
    const text = JSON.stringify(messages);

    // dbs.logs.setItem(step.name, text);
    const msgList = messages.map((m: any) => m.content.toString());
    console.log('UI output generated:', msgList);

    // create method to send UI output to UI channel
    const sendMsgs = [];
    // TODO: make dynamic based on config.channels?
    for (const pub of publish) {
      const sendUiMsg = createSend(channel, pub, 'ui');
      sendMsgs.push(sendUiMsg);
    }

    const sendDeliverable = createSend(
      channel,
      queueNames['deliverables'],
      'ui'
    );

    if (text.match(/-DELIVERABLE-/)) {
      // for fs writer agent to process
      await sendDeliverable({ messages: msgList, meta: { output } });
    }

    for (const sendUiMsg of sendMsgs) {
      await sendUiMsg({ messages: msgList });
    }
    // send output returned from step to UI channel

    // Acknowledge the message to remove it from the queue
    channel.ack(body);
  };
