import { ChatCompletionRequestMessage } from 'openai';
import { RunTaskMessageParams } from './types';
import {
  AbortError,
  CreateSystemMsgOpts,
  fsystem,
  promptAiAndUser,
} from '../question';

export interface ITaskMessageRunner {
  runTaskMessage({
    taskMessage,
    opts,
  }: RunTaskMessageParams): Promise<ChatCompletionRequestMessage[]>;
}

export class TaskMessageRunner {
  constructor(private options: any = {}) {}

  createGetPrompt(message: string | undefined) {
    return async () => message;
  }

  createGetSystemRequestMessage =
    (opts: CreateSystemMsgOpts) =>
    (message: string): ChatCompletionRequestMessage[] => {
      if (!opts.ai) {
        throw new AbortError('Missing ai');
      }
      // TODO: move helper method out from ai
      const chatMsg = fsystem(message);
      return [chatMsg];
    };

  async runTaskMessage({
    taskMessage,
    opts,
  }: RunTaskMessageParams): Promise<ChatCompletionRequestMessage[]> {
    opts = {
      ...this.options,
      ...opts,
    };
    let messages: ChatCompletionRequestMessage[] = opts.messages || [];
    try {
      const getSystemRequestMessages =
        opts.getSystemRequestMessages ||
        this.createGetSystemRequestMessage(opts);
      opts.getPrompt = opts.getPrompt || this.createGetPrompt(taskMessage);
      const { getPrompt } = opts;
      if (!taskMessage) throw new AbortError('missing task message');
      const systemRequestMsgs = getSystemRequestMessages(taskMessage);
      messages.push(...systemRequestMsgs);
      if (!getPrompt) {
        return messages;
      }
      const prompt: any = taskMessage || getPrompt();

      let shouldContinue = true;
      // TODO: ...
      while (shouldContinue) {
        try {
          messages = await promptAiAndUser({ messages, prompt, opts });
        } catch (_) {
          // log abort or error
          shouldContinue = false;
        }
      }
    } catch (_) {
      // log abort or error
    }
    return messages;
  }
}
