import * as fs from 'fs';

export const writeToFile = (path: string, content: string) => {
  fs.writeFileSync(path, content, 'utf8');
};

export const readFromFile = (path: string) => {
  return fs.readFileSync(path, 'utf8');
};
