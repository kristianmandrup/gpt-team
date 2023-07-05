import { ChatCompletionRequestMessage } from 'openai';
import { Control } from '../question';
import { askQuestion } from '../question';
import { AbortEvent } from '../question';

export type IUserRunner = {
  run(): Promise<ChatCompletionRequestMessage | undefined>;
};

const unclear = `\n\n
Is anything else unclear? If yes, only answer in the form:
{remaining unclear areas} remaining questions.\n
{Next question}\n
If everything is sufficiently clear, only answer "no".
`;

export class UserRunner {
  opts: any;

  constructor(opts: any = {}) {
    this.opts = opts;
  }

  async run(): Promise<string | undefined> {
    const userMessage = await this.askUser();
    console.log({ userMessage });
    if (userMessage == Control.ABORT) {
      throw new AbortEvent('user aborted');
    }
    return userMessage;
  }

  async askQuestion(question: string): Promise<string> {
    return await askQuestion(question);
  }

  async askUser(): Promise<string | Control> {
    console.log('createUserMessage');
    let user = await this.askQuestion('(answer in text, or "q" to move on)\n');
    // console.log(`User input: ${user}`);
    if (!user || user === 'q') {
      return Control.ABORT;
    }
    user += unclear;
    return user;
  }
}
