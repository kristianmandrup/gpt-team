import * as path from 'path';
import { ConsumeMessage } from 'amqplib';
import { IPhase, FilePhases } from '@gpt-team/phases';
import { createConsumer } from './consume';
import { MessageBus } from './message-bus';
// import { runPhaseStep } from '@gpt-team/ai';

export type TeamProps = {
  name: string;
};

export type ProcessPhasesOps = {
  basePath: string;
  // createDbs: any;
  mqUrl: string;
  team: TeamProps;
  run: (opts: any) => Promise<void>;
};

export const terminationMsgs = ['COMPLETED', 'TERMINATED'];

// Function to process project descriptions and generate use cases
export async function setupAgentMessageBusProcessor({
  basePath,
  mqUrl,
  // createDbs,
  run,
  team,
}: ProcessPhasesOps) {
  const isTeamDone = ({ body }: any) => {
    return terminationMsgs.includes(body.message) && body.sender == team.name;
  };

  // Db
  // const dbs = createDbs(basePath);

  // RabbitMQ connection URL
  try {
    const msgBus = new MessageBus(mqUrl);

    // Connect to RabbitMQ
    const connection = await msgBus.connect();
    const channel = await msgBus.getChannel();

    // Ensure the queue exists
    console.log('Agent is waiting for messages...');

    const phasesPath = path.join(basePath, 'phases');
    const phases = new FilePhases(phasesPath);
    let phase: IPhase | undefined;

    channel.consume('status', async (cmsg: ConsumeMessage | null) => {
      if (!cmsg) return;
      const body = await channel.parseMsg(cmsg);

      if (isTeamDone({ body, phase })) {
        phases.setDone();
      }
    });

    const chn = channel.getRawChannel();
    phase = await phases.nextPhase();

    while (!phases.isDone()) {
      const task = await phases.nextTask();
      if (phase && phase.isDone()) {
        phase = await phases.nextPhase();
      }
      if (!task) return;
      if (!task.getSubscriptionNames) return;
      // from config.yaml in task folder
      const subscriptions = await task.getSubscriptionNames();
      for (const sub of subscriptions) {
        const consume = createConsumer({ channel, task, run });
        await chn.assertQueue(sub);
        // create subscription
        channel.consume(sub, consume);
      }
    }
    await chn.close();
    await connection.close();
  } catch (error) {
    console.error('Error occurred:', error);
  }
}
