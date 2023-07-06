export interface IAIMocker {
  createChatCompletion(chatRequest?: AiMessageStruct);
}

export class AIMockerWithResponseStack implements IAIMocker {
  protected aiResponseStack = [];

  constructor(aiResponseStack: AiMessageStruct[]) {
    this.aiResponseStack = aiResponseStack;
  }

  createChatCompletion() {
    return this.aiResponseStack.shift();
  }
}
