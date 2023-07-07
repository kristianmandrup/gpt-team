import { ChatCompletionRequestMessage } from 'openai';

export class ChatGptCompletion {
  static toSystemMessage(msg: string): ChatCompletionRequestMessage {
    return { role: 'system', content: msg };
  }

  static toUserMessage(msg: string): ChatCompletionRequestMessage {
    return { role: 'user', content: msg };
  }
}
