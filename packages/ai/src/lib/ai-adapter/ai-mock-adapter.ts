import { IAIAdapter, NextOpts, StartParams } from './types';
import { fsystem, fuser } from '../question';
import { AiMessageStruct } from '../runners/types';
import { IAIMocker } from './ai-mocker';

export class AIMockAdapter implements IAIAdapter {
  protected opts: Record<string, any>;
  protected messages: AiMessageStruct[] = [];
  protected assistantMessage?: string;
  protected mocker: IAIMocker;

  getLatestAssistantMessage(): string | undefined {
    return this.assistantMessage;
  }

  constructor(mocker: IAIMocker, opts: Record<string, any> = {}) {
    this.mocker = mocker;
    this.opts = opts;
  }

  async start(startParams: StartParams) {
    const { user, system } = startParams;
    const sysMessages = system.map(fsystem);
    const userMessages = user.map(fuser);
    const messages: AiMessageStruct[] = [
      ...(sysMessages || []),
      ...(userMessages || []),
    ];
    this.messages = messages;
  }

  async next(opts: NextOpts): Promise<string | undefined> {
    const { messages, prompt } = opts;
    // TODO: use output if present
    if (prompt) {
      const userPromptMessage = fuser(prompt);
      messages.push(userPromptMessage);
    }
    const aiResponses: any[] = await this.aiResponse(messages);
    const chat = this.mapAIResponses(aiResponses);
    const assistantMessage = this.assistantRequest(chat);
    messages.push(assistantMessage);
    this.assistantMessage = assistantMessage.content;
    return this.assistantMessage;
  }

  chatRequestFor(messages: string[]): AiMessageStruct {
    const requestMessages: AiMessageStruct[] =
      this.mapToChatCompletionRequests(messages);
    const lastMsg = requestMessages.pop();
    return {
      content: lastMsg?.content || '',
      ...this.opts,
    };
  }

  async aiResponse(messages: string[]): Promise<string[]> {
    try {
      const chatRequest = this.chatRequestFor(messages);
      console.log('calling createChatCompletion with:', chatRequest);
      return this.mocker.createChatCompletion(chatRequest);
    } catch (ex) {
      console.error(ex);
      throw ex;
    }
  }

  assistantRequest(chat: string[]): AiMessageStruct {
    const content = chat.join('');
    return { meta: { role: 'assistant' }, content };
  }

  mapToChatCompletionRequests(messages: string[], role = 'user') {
    return messages.map((content) => ({ content, role } as AiMessageStruct));
  }

  mapAIResponses(aiCompletionResponse: AiMessageStruct[]): string[] {
    console.log('mapping AI Response', aiCompletionResponse);
    return aiCompletionResponse?.map((choice) => choice?.content ?? '');
  }
}
