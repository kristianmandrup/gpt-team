import 'dotenv/config';

export type AiMessageStruct = {
  content: string;
  meta?: any;
};

export type StartParams = Record<string, any>;

export type NextOpts = {
  messages: any[];
  prompt?: string;
  meta?: any;
};

export interface IAIAdapter {
  start(startParams: StartParams): Promise<void>;
  next(opts: NextOpts): Promise<string | undefined>;
  getLatestAssistantMessage(): string | undefined;
}
