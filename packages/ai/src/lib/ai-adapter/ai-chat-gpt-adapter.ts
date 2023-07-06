import {
  Configuration,
  OpenAIApi,
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
} from 'openai';
import 'dotenv/config';
import { IAIAdapter, NextOpts, StartParams } from './types';
import { fsystem, fuser } from '../question';

export type SimplifiedCompletionResponse = {
  message?: ChatCompletionResponseMessage;
};

export const configuration = new Configuration({
  apiKey: process.env['OPENAI_API_KEY'],
});

export class AIChatGPTAdapter implements IAIAdapter {
  protected client: any;
  protected opts: Record<string, any>;
  protected messages: ChatCompletionRequestMessage[] = [];
  protected assistantMessage?: string;

  getLatestAssistantMessage(): string | undefined {
    return this.assistantMessage;
  }

  constructor(opts?: Record<string, any>, config?: Configuration) {
    console.log('configure OpenAIAPI with', config || configuration);
    this.client = new OpenAIApi(configuration).createChatCompletion;
    this.opts = opts || {};
  }

  async start(startParams: StartParams) {
    const { user, system } = startParams;
    const sysMessages = system.map(fsystem);
    const userMessages = user.map(fuser);
    const messages: ChatCompletionRequestMessage[] = [
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
    console.log('next', { aiResponses });
    const chat = this.mapAIResponses(aiResponses);
    console.log({ chat });
    const assistantMessage = this.assistantRequest(chat);
    console.log({ assistantMessage });
    messages.push(assistantMessage);
    this.assistantMessage = assistantMessage.content;
    return assistantMessage.content;
  }

  chatRequestFor(messages: string[]): CreateChatCompletionRequest {
    const requestMessages: ChatCompletionRequestMessage[] =
      this.mapToChatCompletionRequests(messages);
    return {
      messages: requestMessages,
      model: this.opts['model'] || 'gpt-3.5-turbo',
      ...this.opts,
    };
  }

  async aiResponse(messages: string[]): Promise<string[]> {
    try {
      const chatRequest = this.chatRequestFor(messages);
      console.log('calling createChatCompletion with:', chatRequest);
      const resp = await this.client.createChatCompletion(chatRequest);
      return this.mapAIResponses(resp.data.choices);
    } catch (ex) {
      console.error(ex);
      throw ex;
    }
  }

  assistantRequest(chat: string[]): ChatCompletionRequestMessage {
    const content = chat.join('');
    return { role: 'assistant', content };
  }

  mapToChatCompletionRequests(messages: string[], role = 'user') {
    return messages.map(
      (message) => ({ message, role } as ChatCompletionRequestMessage)
    );
  }

  mapAIResponses(aiCompletionResponse: any[]): string[] {
    console.log('mapping AI Response', aiCompletionResponse);
    return aiCompletionResponse;
  }
}
