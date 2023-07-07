import { createMachine, interpret, send, sendParent } from 'xstate';

// Invoked child machine
const minuteMachine = createMachine({
  id: 'timer',
  initial: 'active',
  states: {
    active: {
      after: {
        60000: { target: 'finished' }
      }
    },
    finished: { type: 'final' }
  }
});

const parentMachine = createMachine({
  id: 'parent',
  initial: 'pending',
  states: {
    pending: {
      invoke: {
        src: minuteMachine,
        // The onDone transition will be taken when the
        // minuteMachine has reached its top-level final state.
        onDone: 'timesUp'
      }
    },
    timesUp: {
      type: 'final'
    }
  }
});

const service = interpret(parentMachine)
  .onTransition((state) => console.log(state.value))
  .start();
// => 'pending'
// ... after 1 minute
// => 'timesUp'