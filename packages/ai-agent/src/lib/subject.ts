import { IObserver } from './observer';

/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
export interface ISubject {
  // Attach an observer to the subject.
  attach(observer: IObserver): void;

  // Detach an observer from the subject.
  detach(observer: IObserver): void;

  // Notify all observers about an event.
  notify(): void;
}
/**
 * The Subject owns some important state and notifies observers when the state
 * changes.
 */
export type MsgMetaInfo = Record<string, any>;

export class MessengerSubject implements ISubject {
  /**
   * @type {number} For the sake of simplicity, the Subject's state, essential
   * to all subscribers, is stored in this variable.
   */
  public messages: string[] = [];
  public message = '';
  public meta: MsgMetaInfo = {};

  struct() {
    return {
      message: this.message,
      meta: this.meta,
    };
  }

  /**
   * @type {IObserver[]} List of subscribers. In real life, the list of
   * subscribers can be stored more comprehensively (categorized by event
   * type, etc.).
   */
  private observers: IObserver[] = [];

  /**
   * The subscription management methods.
   */
  public attach(observer: IObserver): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      return console.log('Subject: Observer has been attached already.');
    }

    console.log('Subject: Attached an observer.');
    this.observers.push(observer);
  }

  public detach(observer: IObserver): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    console.log('Subject: Detached an observer.');
  }

  /**
   * Trigger an update in each subscriber.
   */
  public notify(): void {
    console.log('Subject: Notifying observers...');
    for (const observer of this.observers) {
      observer.update(this);
    }
  }

  /**
   * Usually, the subscription logic is only a fraction of what a Subject can
   * really do. Subjects commonly hold some important business logic, that
   * triggers a notification method whenever something important is about to
   * happen (or after it).
   */
  public sendMsg(message: string, meta: any = {}): void {
    this.message = message;
    this.meta = meta;
    this.messages.push(message);
    console.log(`Added to Subject:`, { message, meta });
    this.notify();
  }
}
