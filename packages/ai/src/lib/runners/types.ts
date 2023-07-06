// types

import { IAIAdapter } from '../ai-adapter';

export type AiMessageStruct = {
  message: string;
  meta?: any;
};

export type IUserRunner = {
  run(): Promise<string | undefined>;
};

export interface IAiRunner {
  run(runParams: RunParams): Promise<string[]>;
}

export interface RunParams {
  messages?: string[];
  options?: any;
}

export interface AIRunnerParams extends RunParams {
  aiAdapter: IAIAdapter;
}

export interface IBaseRunner {
  run(runParams: RunParams): Promise<string[]>;
}

export type AiAndUserRunnerParams = {
  aiRunner: IAiRunner;
  userRunner?: IUserRunner;
  messages?: string[];
  prompt?: string;
  opts?: any;
};

export interface AiAndUserRunParams extends RunParams {
  prompt?: string;
}
