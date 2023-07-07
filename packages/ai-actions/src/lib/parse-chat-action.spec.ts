import { ParseChatAction } from './parse-chat-action';

describe('aiActions', () => {
  let action: ParseChatAction
  beforeEach(() => {
    action = new ParseChatAction()
  })

  const response: any = {
    codeOnly: '```export const a=2;\n```',
    fileOnly: '```a.js\n```',
    codeAndFile: '```a.js\nexport const a=2;\n```'
  }
  const expected: any = {
    // codeOnly: [{content: 'export const a=2;\n'}],
    // fileOnly: [{path: 'a.js'}],
    codeAndFile: [{path: 'a.js', content: 'export const a=2;\n'}]
  }

  describe('code only', () => {
    it('should log missing file and ignore', () => {    
      const result = action.execute(response.codeOnly)
      expect(result).toEqual([]);
      expect(action.logs).toEqual({message: 'missing file', content: 'export const a=2;\n'})
    });
  })

  describe('file only', () => {
    it('should log missing code and ignore', () => {    
      const result = action.execute(response.fileOnly)
      expect(result).toEqual([]);
      expect(action.logs).toEqual({message: 'missing code', path: 'a.js'})
    });
  })

  describe('codeAndFile', () => {
    it('should parse file and code', () => {    
      const result = action.execute(response.codeAndFile)
      expect(result).toEqual(expected.codeAndFile);
      expect(action.logs.length).toBe(0)
    });
  })
});
