import { OnMessage } from '@gpt-team/channel';
import { ISubject } from './subject';
import { IPhase, IPhaseTask } from '@gpt-team/phases';

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

export interface IAIMsgAgent extends IAIAgent {
  update(subject: ISubject): void;
}

export interface IAIChannelAgent extends IAIAgent {
  close: () => Promise<void>;
}

export interface IAIMsgBusAgent extends IAIChannelAgent {
  getSubscriptions(): Promise<string[]>;
  processQueues(): Promise<void>;
  consumeQueues(onMessage: OnMessage): Promise<void>;
}

export interface IAIPhasesAgent extends IAIAgent {
  nextPhase: () => Promise<IPhase | undefined>;
  nextTask: () => Promise<IPhaseTask | undefined>;
  runPhases(): Promise<void>;
  runPhase(): Promise<void>;
}
