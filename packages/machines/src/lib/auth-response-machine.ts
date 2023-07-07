import { createMachine, send, actions } from 'xstate';

const { respond } = actions;

const authServerMachine = createMachine({
  id: 'server',
  initial: 'waitingForCode',
  states: {
    waitingForCode: {
      on: {
        CODE: {
          actions: respond('TOKEN', { delay: 1000 })
        }
      }
    }
  }
});

const authClientMachine = createMachine({
  id: 'client',
  initial: 'idle',
  states: {
    idle: {
      on: {
        AUTH: { target: 'authorizing' }
      }
    },
    authorizing: {
      invoke: {
        id: 'auth-server',
        src: authServerMachine
      },
      entry: send({ type: 'CODE' }, { to: 'auth-server' }),
      on: {
        TOKEN: { target: 'authorized' }
      }
    },
    authorized: {
      type: 'final'
    }
  }
});