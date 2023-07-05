# Ai

This library contains the following modules:

## AI adapter

Currently an AI adapter must implement the following interface:

```ts
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
```

At this time, only `AIChatGPTAdapter` has been implemented as an adapter for ChatGPT 3.5 , but it should be trivial to implement an adapter for any other AI agent.

## Building

Run `nx build ai` to build the library.

## Running unit tests

Run `nx test ai` to execute the unit tests via [Jest](https://jestjs.io).
