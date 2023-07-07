import { AiMessageStruct } from './types';

export interface IAIMocker {
  createChatCompletion(
    chatRequest?: AiMessageStruct
  ): AiMessageStruct | undefined;
}

export class AIMockerWithResponseStack implements IAIMocker {
  protected aiResponseStack: AiMessageStruct[] = [];

  constructor(aiResponseStack: AiMessageStruct[]) {
    this.aiResponseStack = aiResponseStack;
  }

  createChatCompletion(): AiMessageStruct | undefined {
    return this.aiResponseStack.shift();
  }
}
