import * as fs from 'fs';

export const writeToFile = (path: string, content: string) => {
  console.log('writing to', path);
  fs.writeFileSync(path, content, 'utf8');
};

export const readFromFile = (path: string) => {
  console.log('reading from', path);
  return fs.readFileSync(path, 'utf8');
};
