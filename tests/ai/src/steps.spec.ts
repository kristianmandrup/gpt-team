import { ChatCompletionRequestMessage } from 'openai';
import {
  Control,
  getLastResponseMessage,
  promptAi,
} from '@gpt-team/packages/ai-adapter';
// import {expect, jest, test} from '@jest/globals';

describe('promptAi', () => {
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
    const result = await promptAi({ aiResponse, messages });
    expect(result).toBe(Control.ABORT);
  });

  it('ai returns code', async () => {
    const sysMsg: ChatCompletionRequestMessage = {
      role: 'system',
      content: 'hello',
    };
    const messages = [sysMsg];
    responseType = 'code';
    const result = await promptAi({ aiResponse, messages });
    console.log({ result });
    if (result !== Control.ABORT) {
      const resp = getLastResponseMessage(result);
      expect(resp).toBe(response.code);
    } else {
      throw 'WRONG';
    }
  });
});
