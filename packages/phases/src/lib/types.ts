export type PhasesCallback = (phase: IPhases) => void;
export type PhaseCallback = (phase: IPhase) => void;
export type PhaseTaskCallback = (phase: IPhaseTask) => void;

export interface PhasesCallbacks {
  onDone?: PhasesCallback;
  onTaskDone?: PhaseTaskCallback;
  onPhaseAdded?: PhaseCallback;
}

export interface PhaseCallbacks {
  onDone?: PhaseCallback;
  onTaskDone?: PhaseTaskCallback;
  onTaskAdded?: PhaseTaskCallback;
}

export interface PhaseTaskCallbacks {
  onDone?: PhaseTaskCallback;
}

export interface IPhasesOptionParams {
  loggingOn?: boolean;
  callbacks?: PhasesCallbacks;
  meta?: any
}

export interface IPhaseTasksOptionParams {
  loggingOn?: boolean;
  phase?: IPhase;
  callbacks?: PhaseCallbacks;
  meta?: any
}

export interface IPhaseOptionParams {
  loggingOn?: boolean;
  phases?: IPhases;
  callbacks?: PhaseCallbacks;
  meta?: any
}

export interface IPhaseTaskOptionParams {
  loggingOn?: boolean;
  phase?: IPhase;
  callbacks?: PhaseTaskCallbacks;
  meta?: any
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
  getSubscriptions?: () => string[];
  getRecipients?: () => string[];
  getConfig?: () => Promise<any>;
}
