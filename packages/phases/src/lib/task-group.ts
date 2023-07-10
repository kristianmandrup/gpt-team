import { IPhaseTask } from './types';

export class TaskGroup {
  tasks: IPhaseTask[] = [];

  addTask(task: IPhaseTask) {
    this.tasks.push(task);
  }
}
