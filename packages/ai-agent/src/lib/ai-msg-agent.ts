import { MessengerSubject, ISubject, MsgMetaInfo } from './subject';
import { IAIMsgAgent, TeamProps } from './types';
import { IObserver } from './observer';

export type OnMessageCb = (struct: MessageStruct) => void;
export type AIMsgAgentParams = {
  team: TeamProps;
  subject: ISubject;
  onMessageCb?: OnMessageCb;
};

export type MessageStruct = {
  message: string;
  meta: MsgMetaInfo;
};
export class AIMsgAgent implements IAIMsgAgent, IObserver {
  team: TeamProps;
  subject: ISubject;
  messages: MessageStruct[] = [];
  onMessageCb?: OnMessageCb;
  initialized = false;
  done = false;
  meta: any = {};

  protected terminationMsgs = ['COMPLETED', 'TERMINATED'];

  constructor(opts: AIMsgAgentParams) {
    const { team, subject, onMessageCb } = opts;
    this.team = team;
    this.onMessageCb = onMessageCb;
    this.subject = subject;
  }

  setMeta(meta: any = {}) {
    this.meta = meta;
    return this;
  }

  setCb(onMessageCb: OnMessageCb) {
    this.onMessageCb = onMessageCb;
    return this;
  }

  async init() {
    if (this.initialized) return this;
    this.initialized = true;
    this.subject.attach(this);
    return this;
  }

  async start() {
    await this.run();
    return this;
  }

  async run() {
    console.log('run', this.team.name);
    try {
      await this.init();
      await this.processMessages();
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  setDone() {
    this.done = true;
  }

  isDone() {
    return this.done;
  }

  // observer
  update(subject: ISubject): void {
    if (subject instanceof MessengerSubject) this.onMessage(subject.struct());
  }

  async processMessages() {
    console.log('processing...');
  }

  popMessage() {
    return this.messages.shift();
  }

  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }

  onMessage(struct: MessageStruct) {
    console.log('received', struct);
    this.messages.push(struct);
    console.log('call callback', struct);
    this.onMessageCb && this.onMessageCb(struct);
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
    this.subject.detach(this);
  }
}
