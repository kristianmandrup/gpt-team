export type PhasesCallback = (phase: IPhases) => void;
export type PhaseCallback = (phase: IPhase) => void;
export type PhaseTaskCallback = (phase: IPhaseTask) => void;

export interface PhasesCallbacks {
  onDone?: PhasesCallback;
  onTaskDone?: PhaseTaskCallback;
}

export interface PhaseCallbacks {
  onDone?: PhaseCallback;
}

export interface PhaseTaskCallbacks {
  onDone?: PhaseTaskCallback;
}

export interface IPhaseOptionParams {
  phases?: IPhases;
  callbacks?: PhaseCallbacks;
}

export interface IPhaseTaskOptionParams {
  phase?: IPhase;
  callbacks?: PhaseTaskCallbacks;
}

export interface IPhases {
  isDone(): boolean;
  setDone(): void;
  loadPhases?: () => Promise<void>;
  nextPhase(): Promise<IPhase | undefined>;
  nextTask(): Promise<IPhaseTask | undefined>;
}
export interface IPhase {
  name: string;
  getPhases?: () => IPhases | undefined;
  isDone(): boolean;
  setDone(): void;
  getGoal(): string;
  loadGoal?: () => Promise<void>;
  nextTask(): Promise<IPhaseTask | undefined>;
}
export interface IPhaseTasks {
  getPhase?: () => IPhase | undefined;
  loadTasks?: () => Promise<void>;
  nextTask(): Promise<IPhaseTask | undefined>;
}
export interface IPhaseTask {
  getName?(): string;
  getPhase?: () => IPhase | undefined;
  addMessage: (message: string) => void;
  loadMessages?: () => Promise<void>;
  nextMessage: () => Promise<string | undefined>;
  getSubscriptionNames?: () => Promise<string[]>;
  getConfig?: () => Promise<any>;
}
