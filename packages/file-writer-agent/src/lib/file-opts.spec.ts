import * as fs from 'fs';
import { vol } from 'memfs';
import { writeToFile, readFromFile } from './file-ops';

jest.mock('fs', () => jest.requireActual('memfs'));

beforeEach(() => {
  vol.reset(); // Reset the in-memory file system before each test
});

describe('File operations', () => {
  it('should write to and read from a file', () => {
    const filePath = '/hello.txt';
    const fileContent = 'hello world';

    writeToFile(filePath, fileContent); // Write to the file

    // Check that the file was written
    expect(fs.existsSync(filePath)).toBeTruthy();

    // Read from the file and check that the content is correct
    const readContent = readFromFile(filePath);
    expect(readContent).toBe(fileContent);
  });
});
