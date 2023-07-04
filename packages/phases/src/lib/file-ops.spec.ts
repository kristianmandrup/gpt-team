import * as fs from 'fs';
import * as path from 'path';
import { vol } from 'memfs';
import { writeToFile, readFromFile } from './file-ops';

jest.mock('fs', () => jest.requireActual('memfs'));

describe('File operations', () => {
  beforeEach(() => {
    vol.reset(); // Reset the in-memory file system before each test
    vol.mkdirSync(path.join(process.cwd()), { recursive: true }); // Create the directory structure
  });

  it('should write to and read from a file', () => {
    const fileName = 'hello.txt';
    const filePath = path.join(process.cwd(), fileName);
    const fileContent = 'hello world';

    writeToFile(filePath, fileContent); // Write to the file

    // Check that the file was written
    expect(fs.existsSync(filePath)).toBeTruthy();

    // Read from the file and check that the content is correct
    const readContent = readFromFile(filePath);
    expect(readContent).toBe(fileContent);
  });
});
