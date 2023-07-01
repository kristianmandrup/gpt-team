export type TeamProps = {
  name: string;
};

export type ProcessPhasesOps = {
  basePath: string;
  createDbs: any;
  mqUrl: string;
  team: TeamProps;
};

export interface IAIAgent {
  team: TeamProps;

  init: () => Promise<IAIAgent>;
  run: () => Promise<void>;
}

export interface IAIChannelAgent extends IAIAgent {
  close: () => Promise<void>;
}
