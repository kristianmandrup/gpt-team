import { ChatToFilesAction } from './chat-to-files-action';

describe('ChatToFilesAction', () => {
  let action: ChatToFilesAction
  beforeEach(() => {
    action = new ChatToFilesAction()
  })

  it('should work', () => {
    const expected: any = {
      fileSys: {
        'a.txt': 'hello world'
      }
    }
    const files = [{path: 'a.txt', content: 'hello world'}]

    expect(action.execute(files)).toEqual(expected.fileSys);
  });
});
