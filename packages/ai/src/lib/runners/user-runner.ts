// user runner

import { Control } from '../question';
import { askQuestion } from '../question';
import { AbortEvent } from '../question';

export type IUserRunner = {
  run(opts: any): Promise<string | undefined>;
};

const unclearMsg = `\n\n
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

  buildUserMessage(userMessage: string) {
    return userMessage.concat(unclearMsg);
  }

  async askUser(): Promise<string | Control> {
    console.log('createUserMessage');
    const userMsg = await this.askQuestion(
      '(answer in text, or "q" to move on)\n'
    );
    // console.log(`User input: ${user}`);
    if (!userMsg || userMsg === 'q') {
      return Control.ABORT;
    }
    return this.buildUserMessage(userMsg);
  }
}
