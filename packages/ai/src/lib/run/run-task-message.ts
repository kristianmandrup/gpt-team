import { RunTaskMessageParams } from './types';
import { ChatCompletionRequestMessage } from 'openai';
import { promptAiAndUser } from '../question/prompt-ai';
import { AbortError } from '../question/exceptions';
import {
  createGetPrompt,
  createGetSystemRequestMessage,
} from '../question/functions';

export async function runTaskMessage({
  taskMessage,
  opts,
}: RunTaskMessageParams): Promise<ChatCompletionRequestMessage[]> {
  let messages: ChatCompletionRequestMessage[] = opts.messages || [];
  try {
    const getSystemRequestMessages =
      opts.getSystemRequestMessages || createGetSystemRequestMessage(opts);
    opts.getPrompt = opts.getPrompt || createGetPrompt(taskMessage);
    const { getPrompt } = opts;
    if (!taskMessage) throw new AbortError('missing task message');
    const systemRequestMsgs = getSystemRequestMessages(taskMessage, opts);
    messages.push(...systemRequestMsgs);
    if (!getPrompt) {
      return messages;
    }
    const prompt = taskMessage || (await getPrompt());
    let shouldContinue = true;
    // TODO: ...
    while (shouldContinue) {
      try {
        messages = await promptAiAndUser({ messages, prompt, opts });
      } catch (_) {
        // log abort or error
        shouldContinue = false;
      }
    }
  } catch (_) {
    // log abort or error
  }
  return messages;
}
