export type PhasesCallback = (phase: IPhases) => void;
export type PhaseCallback = (phase: IPhase) => void;
export type PhaseTaskCallback = (phase: IPhaseTask) => void;

export interface PhasesCallbacks {
  onDone?: PhasesCallback;
  onTaskDone?: PhaseTaskCallback;
}

export interface PhaseCallbacks {
  onDone?: PhaseCallback;
  onTaskDone?: PhaseTaskCallback;
}

export interface PhaseTaskCallbacks {
  onDone?: PhaseTaskCallback;
}

export interface IPhasesOptionParams {
  callbacks?: PhasesCallbacks;
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
  onTaskDone?: PhaseTaskCallback;
  isDone(): boolean;
  setDone(): void;
  loadPhases?: () => Promise<void>;
  nextPhase(): Promise<IPhase | undefined>;
  nextTask(): Promise<IPhaseTask | undefined>;
}
export interface IPhase {
  getName?(): string;
  getGoal?(): string;
  onTaskDone?: PhaseTaskCallback;
  getPhases?: () => IPhases | undefined;
  isDone(): boolean;
  setDone(): void;
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
  getGoal?(): string;
  isDone(): boolean;
  setDone(): void;
  getPhase?: () => IPhase | undefined;
  addMessage?: (message: string) => void;
  loadMessages?: () => Promise<void>;
  nextMessage: () => Promise<string | undefined>;
  getSubscriptionNames?: () => Promise<string[]>;
  getConfig?: () => Promise<any>;
}
