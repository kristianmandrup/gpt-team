import type { ChatCompletionRequestMessage } from 'openai';
import { Control, getControl, PromptAiOpts } from '../question';
import { createGetAiResponse } from '../response/';
import { getLastResponseMessage } from '../message';
import { AbortError, AbortEvent } from '../question';
import { UserRunner } from './user-runner';
import { IAgentRunner } from './types';

export interface IAiAndUserRunner extends IAgentRunner {
  run(): Promise<ChatCompletionRequestMessage[]>;
}

export class AiAndUserRunner implements IAiAndUserRunner {
  protected messages: ChatCompletionRequestMessage[] = [];
  protected prompt?: string;
  protected opts?: any;

  constructor({ messages, prompt, opts }: PromptAiOpts) {
    this.messages = messages;
    this.prompt = prompt;
    this.opts = opts;
  }

  async run(): Promise<ChatCompletionRequestMessage[]> {
    const { opts, messages, prompt } = this;
    try {
      const getAiResponse = createGetAiResponse(opts);
      if (!getAiResponse) {
        throw new AbortError('missing getAiResponse');
      }
      const responseMessages = await getAiResponse({ messages, prompt });
      const aiGeneratedContent = getLastResponseMessage(responseMessages);
      // Ai can terminate further processing by saying no to needing further clarification from user
      const control = getControl(aiGeneratedContent);
      if (control == Control.ABORT) {
        throw new AbortEvent('AI completed');
      }
      const userRunner = new UserRunner(opts);
      // User can terminate further processing by writing command to abort (q = quit)
      const userMessage = await userRunner.run();
      userMessage && messages.push(userMessage);
    } catch (_) {
      return messages;
    }
    return messages;
  }
}
