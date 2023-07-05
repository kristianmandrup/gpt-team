import { FileInfo } from './types';

export function parseChat(chat: string): FileInfo[] {
  const regex = /```(.*?)```/gs;
  const matches = chat.matchAll(regex);

  const files: FileInfo[] = [];
  for (const match of matches) {
    const path = match[1].split('\n')[0];
    const content = match[1].split('\n').slice(1).join('\n');
    files.push({ path, content });
  }

  return files;
}
