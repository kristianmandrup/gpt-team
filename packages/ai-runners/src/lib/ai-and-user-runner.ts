import { Control, getControl } from '../question';
import { AbortEvent } from '../question';
import { IUserRunner } from './user-runner';
import {
  AiAndUserRunParams,
  AiAndUserRunnerParams,
  IAiRunner,
  IBaseRunner,
} from './types';

export class AiAndUserRunner implements IBaseRunner {
  protected messages: string[] = [];
  protected prompt?: string;
  protected opts?: any;
  protected aiRunner: IAiRunner;
  protected userRunner?: IUserRunner;

  constructor({
    aiRunner,
    userRunner,
    messages,
    prompt,
    opts,
  }: AiAndUserRunnerParams) {
    this.aiRunner = aiRunner;
    this.userRunner = userRunner;
    this.messages = messages || this.messages;
    this.prompt = prompt;
    this.opts = opts;
  }

  setAiRunner(aiRunner: IAiRunner) {
    this.aiRunner = aiRunner;
  }

  setUserRunner(userRunner: IUserRunner) {
    this.userRunner = userRunner;
  }

  getLastMessage(messages: string[]): string | undefined {
    return messages[messages.length - 1];
  }

  async run(runOpts: AiAndUserRunParams = {}): Promise<string[]> {
    const { messages } = this;
    try {
      const aiGeneratedMessages = await this.aiRunner?.run({ messages });
      if (!aiGeneratedMessages) return [];
      const lastMessage = this.getLastMessage(aiGeneratedMessages);
      // Ai can terminate further processing by saying no to needing further clarification from user
      const control = getControl(lastMessage);
      if (control == Control.ABORT) {
        throw new AbortEvent('AI completed');
      }

      // User can terminate further processing by writing command to abort (q = quit)
      const userMessage = await this.userRunner?.run(runOpts);
      userMessage && messages.push(userMessage);
    } catch (_) {
      return messages;
    }
    return messages;
  }
}
