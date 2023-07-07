import { BaseAction } from './base-action';
import { FileInfo } from './types';

export class ChatToFilesAction extends BaseAction {
  execute(
    files: FileInfo[],
  ): Record<string, string> {
    const fileSys: Record<string, string> = {};
    // TODO: if output in opts is set use it to determine what the file is and where it should be put
    for (const { path, content } of files) {
      fileSys[path] = content;
    }
    return fileSys;
  }
}