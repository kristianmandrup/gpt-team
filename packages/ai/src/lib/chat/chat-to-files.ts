import { DB } from '@gpt-team/agent-storage';
import { FileInfo } from './types';
import { parseChat } from './parse-chat';

export function filesToFileSystem(
  workspace: DB,
  files: FileInfo[],
  opts: any = {}
): Record<string, string> {
  const fileSys: Record<string, string> = {};
  // TODO: if output in opts is set use it to determine what the file is and where it should be put
  for (const { path, content } of files) {
    workspace.setItem(path, content);
    fileSys[path] = content;
  }
  return fileSys;
}

export function toFiles(workspace: DB, chat?: string): void {
  if (!chat) return;
  workspace.setItem('all_output.txt', chat);

  const files = parseChat(chat);
  for (const { path, content } of files) {
    workspace.setItem(path, content);
  }
}
