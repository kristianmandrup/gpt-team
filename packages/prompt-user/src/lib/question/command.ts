export const parseCommand = (content: string | undefined) =>
  content ? content.trim().toLowerCase() : '';

export const getControl = (content?: string) => {
  const possibleCommand = parseCommand(content);
  if (!content || possibleCommand === 'no') {
    return Control.ABORT;
  }
  return;
  // return Control.CONTINUE;
};

export enum Control {
  ABORT,
  CONTINUE,
}
