import { parseChat, FileInfo } from '@gpt-team/packages/ai-adapter';
import * as path from 'path';
import {
  AIMsgAgent,
  ISubject,
  type AIMsgAgentParams,
  MessengerSubject,
  MessageStruct,
} from '@gpt-team/ai-agent';
import { writeToFile } from './file-ops';

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

  fileToFileSystem(fi: FileInfo, meta: any = {}) {
    meta = {
      ...this.meta,
      meta,
    };
    console.log('writing to', fi);
    const write = meta.writeToFile || writeToFile;
    write(fi.path, fi.content);
  }

  // use fs to write files
  filesToFileSystem(filesInfo: FileInfo[], meta: any = {}) {
    const writeFile = this.fileToFileSystem.bind(this);
    filesInfo.map((fi) => writeFile(fi, meta));
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
    super.onMessage(struct);
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
