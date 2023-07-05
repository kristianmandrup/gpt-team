import { ChatCompletionResponseMessage } from 'openai';
import {
  AIChatGPTAdapter,
  SimplifiedCompletionResponse,
} from './ai-chat-gpt-adapter';

describe('AIChatGptAdapter', () => {
  let ai: AIChatGPTAdapter;
  beforeEach(() => {
    ai = new AIChatGPTAdapter();
    ai.aiResponse = async (): Promise<SimplifiedCompletionResponse[]> => {
      const choice: SimplifiedCompletionResponse = {
        message: {
          role: 'assistant',
          content: 'exactly right',
        },
      };
      return [choice];
    };
    // mock ai.aiResponse or this.client.createChatCompletion
  });

  it('should make an AI response', async () => {
    const user = ['hello'];
    const system = ['hi'];
    await ai.start({ user, system });
    const messages = ['hi there'];
    const prompt = 'what is your name?';
    await ai.next({ messages, prompt });
    const aiMsg = ai.getLatestAssistantMessage();
    expect(aiMsg).toEqual('exactly right');
  });

  it('should map responses', () => {
    const aiCompletionResponses: Array<SimplifiedCompletionResponse> = [
      {
        message: {
          role: 'system',
          content: 'hello',
        },
      },
    ];
    const list = ai.mapAIResponses(aiCompletionResponses);
    expect(list.pop());
  });
});
