import { ISubject } from './subject';

/**
 * The Observer interface declares the update method, used by subjects.
 */
export interface IObserver {
  // Receive update from subject.
  update(subject: ISubject): void;
}
