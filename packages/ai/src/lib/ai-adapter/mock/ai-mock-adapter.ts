import { ChatGptCompletion } from '../chat-gpt/chat-gpt-completion';
import { IAIAdapter, NextOpts, StartParams } from '../types';
import { AiMessageStruct } from '../types';
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

  toUserMessage(message: string) {
    return ChatGptCompletion.toUserMessage(message)
  }

  toSystemMessage(message: string) {
    return ChatGptCompletion.toSystemMessage(message)
  }

  async start(startParams: StartParams) {
    const { user, system } = startParams;
    const sysMessages = system && system.map(this.toSystemMessage);
    const userMessages = user && user.map(this.toUserMessage);
    const messages: AiMessageStruct[] = [
      ...(sysMessages || []),
      ...(userMessages || []),
    ];
    this.messages = messages;
  }

  async next(opts: NextOpts): Promise<string | undefined> {
    const { messages, prompt } = opts;
    // TODO: use output if present
    const allMessages = [...this.messages, ...messages]
    if (prompt) {
      const userPromptMessage = ChatGptCompletion.toUserMessage(prompt);
      allMessages.push(userPromptMessage);
    }
    const aiResponses: any[] = await this.aiResponse(allMessages);
    const chat = this.mapAIResponses(aiResponses);
    const assistantMessage = this.assistantRequest(chat);
    allMessages.push(assistantMessage);
    this.assistantMessage = assistantMessage.content;
    this.messages = allMessages;
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
