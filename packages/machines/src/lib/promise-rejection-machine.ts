import { createMachine, interpret, assign, send, sendParent } from 'xstate';

const getSearchResults = (query: string) => ({ data: ['result A'] })

const search = (context: any, event: any) =>
  new Promise((resolve, reject) => {
    if (!event.query.length) {
      return reject('No query specified');
      // or:
      // throw new Error('No query specified');
    }

    return resolve(getSearchResults(event.query));
  });

// ...
const searchMachine = createMachine({
  id: 'search',
  initial: 'idle',
  context: {
    results: undefined,
    errorMessage: undefined
  },
  states: {
    idle: {
      on: {
        SEARCH: { target: 'searching' }
      }
    },
    searching: {
      invoke: {
        id: 'search',
        src: search,
        onError: {
          target: 'failure',
          actions: assign({
            errorMessage: (context, event) => {
              // event is:
              // { type: 'error.platform', data: 'No query specified' }
              return event.data;
            }
          })
        },
        onDone: {
          target: 'success',
          actions: assign({ results: (_, event) => event.data })
        }
      }
    },
    success: {},
    failure: {}
  }
});