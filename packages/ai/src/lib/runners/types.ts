export type IAgentRunner = {
  run(): Promise<any>;
};

export type IUserRunner = {
  run(): Promise<string | undefined>;
};
