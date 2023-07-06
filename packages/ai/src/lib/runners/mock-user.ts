import { IUser } from './user';

export type ResponseMap = Record<string, string>;

export class MockUserWithResponseMap implements IUser {
  protected responseMap: ResponseMap = {};

  constructor(responseMap: ResponseMap) {
    this.responseMap = responseMap;
  }

  async askQuestion(question: string): Promise<string> {
    return this.responseMap[question] as string;
  }
}

export class MockUserWithResponseStack implements IUser {
  protected responseStack: string[] = [];

  constructor(responseStack: string[]) {
    this.responseStack = responseStack;
  }

  async askQuestion(): Promise<string> {
    return this.responseStack.shift() || '';
  }
}
