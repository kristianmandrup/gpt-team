import {
  Configuration,
  OpenAIApi,
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
} from 'openai';
import 'dotenv/config';
import { IAIAdapter, NextOpts } from './types';
import { fsystem, fuser } from '../question';

export type SimplifiedCompletionResponse = {
  message?: ChatCompletionResponseMessage;
};

export const configuration = new Configuration({
  apiKey: process.env['OPENAI_API_KEY'],
});

export type StartParams = Record<string, any>;

export class AIChatGPTAdapter implements IAIAdapter {
  protected client: any;
  protected opts: Record<string, any>;
  protected messages: ChatCompletionRequestMessage[] = [];
  protected assistantMessage?: string;

  getLatestAssistantMessage() {
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

  async next(opts: NextOpts): Promise<void> {
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
  }

  chatRequestFor(
    messages: ChatCompletionRequestMessage[]
  ): CreateChatCompletionRequest {
    return {
      messages,
      model: this.opts['model'] || 'gpt-3.5-turbo',
      ...this.opts,
    };
  }

  async aiResponse(messages: ChatCompletionRequestMessage[]) {
    try {
      const chatRequest = this.chatRequestFor(messages);
      console.log('calling createChatCompletion with:', chatRequest);
      const resp = await this.client.createChatCompletion(chatRequest);
      return resp.data.choices;
    } catch (ex) {
      console.error(ex);
      throw ex;
    }
  }

  assistantRequest(chat: string[]): ChatCompletionRequestMessage {
    const content = chat.join('');
    return { role: 'assistant', content };
  }

  mapAIResponses(
    aiCompletionResponse: SimplifiedCompletionResponse[]
  ): string[] {
    console.log('mapping AI Response', aiCompletionResponse);
    return aiCompletionResponse?.map(
      (choice) => choice?.message?.content ?? ''
    );
  }
}
