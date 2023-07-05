import 'dotenv/config';
import { StartParams } from './ai-chat-gpt-adapter';

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
