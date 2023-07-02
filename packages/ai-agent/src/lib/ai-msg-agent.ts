import { MessengerSubject, ISubject } from './subject';
import { IAIMsgAgent, TeamProps } from './types';
import { IObserver } from './observer';

export class AIMsgAgent implements IAIMsgAgent, IObserver {
  team: TeamProps;
  subject: ISubject;

  protected terminationMsgs = ['COMPLETED', 'TERMINATED'];

  constructor(opts: { team: TeamProps; subject: ISubject }) {
    const { team, subject } = opts;
    this.team = team;
    this.subject = subject;
  }

  async init() {
    return this;
  }

  async start() {
    await this.run();
  }

  async run() {
    try {
      await this.init();
      while (!this.isDone()) {
        await this.processMessages();
      }
      await this.close();
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  isDone() {
    return false;
  }

  update(subject: ISubject): void {
    if (subject instanceof MessengerSubject) this.onMessage(subject.message);
  }

  async processMessages() {
    this.subject.attach(this);
  }

  onMessage(msg: string) {
    console.log({ received: msg });
  }

  protected isTeamDone({ body }: any) {
    return (
      this.terminationMsgs.includes(body.message) &&
      body.sender == this.team.name
    );
  }

  async stopWhenDone() {
    return await this.onDone();
  }

  async onDone() {
    return;
  }

  async close() {
    // stop listening to messages
  }
}
