# Ai

This library contpackages-ai-adapterns the following modules:

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

At this time, only `AIChatGPTAdapter` has been implemented as an adapter for ChatGPT 3.5, but it should be trivial to implement an adapter for any other AI agent.

A `AIMockAdapter` is included to simulate and mock an AI adapter.
This adapter takes a `mocker` of type `IAIMocker` which must implement a `createChatCompletion` method that simulates the AI returning a ChatCompletion in the form of an `AiMessageStruct`

```ts
export type AiMessageStruct = {
  content: string;
  meta?: any;
};

export interface IAIMocker {
  createChatCompletion(chatRequest?: AiMessageStruct): AiMessageStruct | undefined;
}
```

The following is an example of using the `AIMockAdapter` with a `mocker` to simulate the AI.

```ts
const responseStack = ['hello from AI'];
const mocker: IAIMocker = new AIMockerWithResponseStack(responseStack);
const packages-ai-adapterAdapter = new AIMockAdapter(mocker);
const packages-ai-adapterRunner = new AiRunner({ packages-ai-adapterAdapter });
```

## Building

Run `nx build packages-ai-adapter` to build the library.

## Running unit tests

Run `nx test packages-ai-adapter` to execute the unit tests via [Jest](https://jestjs.io).
