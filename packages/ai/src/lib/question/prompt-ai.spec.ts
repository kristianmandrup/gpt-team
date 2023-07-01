import { ChatCompletionRequestMessage } from 'openai';
import { AbortEvent, Control, promptAiAndUser } from './';
// import { getLastResponseMessage } from '../message';
// import {expect, jest, test} from '@jest/globals';

describe.skip('promptAi', () => {
  // mock ai.next
  const response: any = {
    no: 'no',
    code: `
"""
function hello() {}
"""
        `,
  };

  let responseType = 'code';

  const aiResponse = async (opts: any) => response[responseType];

  it('aborts on command: no', async () => {
    const sysMsg: ChatCompletionRequestMessage = {
      role: 'system',
      content: 'hello',
    };
    const messages = [sysMsg];
    responseType = 'no';
    const result = await promptAiAndUser({ aiResponse, messages });
    expect(result).toBe(Control.ABORT);
  });

  it('ai returns code', async () => {
    const sysMsg: ChatCompletionRequestMessage = {
      role: 'system',
      content: 'hello',
    };
    const messages = [sysMsg];
    responseType = 'code';
    try {
      const result = await promptAiAndUser({ aiResponse, messages });
      expect(result).toBeDefined();
    } catch (event) {
      expect(event).toBeInstanceOf(AbortEvent);
    }
  });
});
