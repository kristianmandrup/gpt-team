import * as amqp from 'amqplib';

export const parseMsg = (message: amqp.ConsumeMessage | null) => {
  if (!message) return;
  const { content } = message;
  const msg = content.toString();
  const body = JSON.parse(msg);
  return body;
};
