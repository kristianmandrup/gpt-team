import { getControl, AbortEvent, Control } from '../question';
import { IAIAdapter } from '../ai-adapter';
import { AIRunnerParams, IAiRunner, RunParams } from './types';

export class AiRunner implements IAiRunner {
  opts: any = {};
  protected messages: string[] = [];
  protected aiAdapter: IAIAdapter;

  constructor({ aiAdapter, messages, options }: AIRunnerParams) {
    this.messages = messages || [];
    this.opts = options || {};
    this.aiAdapter = aiAdapter;
  }

  setAiAdapter(aiAdapter: IAIAdapter) {
    this.aiAdapter = aiAdapter;
  }

  getAiAdapter(): IAIAdapter | undefined {
    return this.aiAdapter;
  }

  async getAiResponse(runOpts: RunParams = {}): Promise<string | undefined> {
    const { messages } = this;
    const allMessages = messages.concat(runOpts.messages);
    const meta = {
      ...this.opts,
      ...runOpts,
    };
    if (!runOpts.messages) return;
    return await this.getAiAdapter()?.next({ messages: allMessages, meta });
  }

  async run(runOpts: RunParams = {}) {
    const responseMessage = await this.getAiResponse(runOpts);
    if (!responseMessage) {
      throw new AbortEvent('No AI response');
    }
    // Ai can terminate further processing by saying no to needing further clarification from user
    const control = getControl(responseMessage);
    if (control == Control.ABORT) {
      throw new AbortEvent('AI completed');
    }
    return [responseMessage];
  }
}
