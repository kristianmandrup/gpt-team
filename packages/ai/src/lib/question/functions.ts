import { ChatCompletionRequestMessage } from 'openai';
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
