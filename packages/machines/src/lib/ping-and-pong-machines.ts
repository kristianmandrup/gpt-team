import { createMachine, interpret, send, sendParent } from 'xstate';

// Invoked child machine
const pongMachine = createMachine({
    id: 'pong',
    initial: 'active',
    states: {
      active: {
        on: {
          PING: {
            // Sends 'PONG' event to parent machine
            actions: sendParent('PONG', {
              delay: 1000
            })
          }
        }
      }
    }
  });

// Parent machine
const pingMachine = createMachine({
  id: 'ping',
  initial: 'active',
  states: {
    active: {
      invoke: {
        id: 'pong',
        src: pongMachine
      },
      // Sends 'PING' event to child machine with ID 'pong'
      entry: send({ type: 'PING' }, { to: 'pong' }),
      on: {
        PONG: {
          actions: send({ type: 'PING' }, { to: 'pong', delay: 1000 })
        }
      }
    }
  }
});



const service = interpret(pingMachine).start();

// => 'ping'
// ...
// => 'pong'
// ..
// => 'ping'
// ...
// => 'pong'
// ...