import { ChatCompletionRequestMessage } from 'openai';
import { AbortError } from './exceptions';
import { IAIAdapter } from '../ai-adapter';

export type CreateSystemMsgOpts = {
  ai?: IAIAdapter;
};

export const fsystem = (msg: string): ChatCompletionRequestMessage => {
  return { role: 'system', content: msg };
};

export const fuser = (msg: string): ChatCompletionRequestMessage => {
  return { role: 'user', content: msg };
};

export const createGetPrompt = (message: string | undefined) => async () =>
  message;

export const createGetNextTaskMessage = (opts: any) => async () =>
  opts.task.nextMessage();

export const createGetSystemRequestMessage =
  (opts: CreateSystemMsgOpts) =>
  (message: string, options: any): ChatCompletionRequestMessage[] => {
    if (!opts.ai) {
      throw new AbortError('Missing ai');
    }
    // TODO: move helper method out from ai
    const chatMsg = fsystem(message);
    return [chatMsg];
  };
