import { askQuestion } from '../question';

export interface IUser {
  askQuestion(question: string): Promise<string>;
}

export class User {
  async askQuestion(question: string): Promise<string> {
    return await askQuestion(question);
  }
}
