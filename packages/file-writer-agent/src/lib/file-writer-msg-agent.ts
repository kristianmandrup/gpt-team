import * as amqp from 'amqplib';
import { parseChat, filesToFileSystem, FileInfo } from '@gpt-team/ai';
import * as path from 'path';
import {
  AIMsgAgent,
  ISubject,
  type AIMsgAgentParams,
  MessengerSubject,
  MessageStruct,
} from '@gpt-team/ai-agent';

// Function to process project descriptions and generate use cases
export class FileWriterMsgAgent extends AIMsgAgent {
  basePath: string = process.cwd();
  subjects: Record<string, ISubject> = {};
  fs: any;

  get subjectNames() {
    return Object.keys(this.subjects);
  }

  constructor(opts: AIMsgAgentParams) {
    super(opts);
    this.basePath = path.join(process.cwd(), 'agents', 'api-agent', 'db');
  }

  get workspace(): any {
    return {};
  }

  parseMsg(struct: MessageStruct) {
    // Use the message to extract file info and write to file system
    return { content: struct.message, meta: struct.meta };
  }

  // use fs to write files
  filesToFileSystem(filesInfo: FileInfo[], meta: any) {
    return;
  }

  setFs(fs: any) {
    this.fs = fs;
  }

  override onMessage(struct: MessageStruct) {
    if (!struct) return;
    const { content, meta } = this.parseMsg(struct);
    const files = parseChat(content);
    const fileSys = this.filesToFileSystem(files, meta);
    const metaInfo = {
      files,
      fileSys,
    };
    const msg = 'files written to fs';
    this.sendMsgToAll(msg, metaInfo);

    // send output returned from step to UI channel
  }

  sendMsgToAll(message: string, metaInfo: any) {
    this.subjectNames.forEach((name) => this.sendMsg(name, message, metaInfo));
  }

  sendMsg(name: string, message: string, metaInfo: any) {
    const subject = this.subjects[name] as MessengerSubject;
    if (!subject) return;
    subject?.sendMsg(message, metaInfo);
  }
}
