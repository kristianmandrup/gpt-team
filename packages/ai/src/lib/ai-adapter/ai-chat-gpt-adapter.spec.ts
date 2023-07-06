import { AIChatGPTAdapter } from './ai-chat-gpt-adapter';

describe('AIChatGptAdapter', () => {
  let ai: AIChatGPTAdapter;
  const aiResponseMap: Record<string, string> = {
    add: '4',
  };

  beforeEach(() => {
    ai = new AIChatGPTAdapter();
    ai.aiResponse = async (): Promise<string[]> => {
      return ['exactly right'];
    };
    // mock ai.aiResponse or this.client.createChatCompletion
  });

  it('should map responses', async () => {
    const messages = await ai.aiResponse(['What is 2+2?']);
    expect(messages[0]).toContain(aiResponseMap['add']);
  });

  it('should make an AI response', async () => {
    const user = ['hello'];
    const system = ['hi'];
    await ai.start({ user, system });
    const messages = ['hi there'];
    const prompt = 'what is 2+2?';
    await ai.next({ messages, prompt });
    const aiMsg = ai.getLatestAssistantMessage();
    expect(aiMsg).toEqual(aiResponseMap['add']);
  });
});
