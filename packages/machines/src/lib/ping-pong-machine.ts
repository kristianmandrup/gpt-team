import { createMachine, interpret, assign, send, sendParent } from 'xstate';

const pingPongMachine = createMachine({
    id: 'pinger',
    initial: 'active',
    states: {
      active: {
        invoke: {
          id: 'ponger',
          src: (context, event) => (callback, onReceive) => {
            // Whenever parent sends 'PING',
            // send parent 'PONG' event
            onReceive((e) => {
              if (e.type === 'PING') {
                callback('PONG');
              }
            });
          }
        },
        entry: send({ type: 'PING' }, { to: 'ponger' }),
        on: {
          PONG: { target: 'done' }
        }
      },
      done: {
        type: 'final'
      }
    }
  });

  const done = () => console.log('DONE')
  
  interpret(pingPongMachine)
    .onDone(() => done())
    .start();