import { BaseAction } from './base-action';
import { FileInfo } from './types';

export class ParseChatAction extends BaseAction {
  log(message: string, meta: any) {
    this.logs.push({message, meta})
  }

  execute(chat: string): FileInfo[] {
    const regex = /```(.*?)```/gs;
    const matches = chat.matchAll(regex);

    const files: FileInfo[] = [];
    for (const match of matches) {
      const path = match[1].split('\n')[0];
      const content = match[1].split('\n').slice(1).join('\n');
      if (!content && !path) {
        continue
      }
      if (!content) {
        this.log('missing content', {
          path
        })
        continue;
      } 
      if (!path) {
        this.log('missing path', {
          content
        })
        continue;
      } 
      files.push({ path, content });
    }

    return files;
  }
}
