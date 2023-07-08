import * as fs from 'fs';
import * as path from 'path';

export class FilePhaseHandler {
  public ordering: any = [];
  protected loggingOn = false;

  constructor({ loggingOn }: any = {}) {
    this.loggingOn = loggingOn;
  }

  log(msg: string) {
    if (!this.loggingOn) return;
    console.log(msg);
  }

  indexOf(folderPath: string): number {
    const fileName = path.parse(folderPath).name;
    return this.ordering.indexOf(fileName);
  }

  isValidTaskFileExt(filePath: string) {
    return ['.txt', '.md'].includes(path.extname(filePath));
  }

  isFolder(filePath: string) {
    try {
      const stats = fs.statSync(filePath);
      const isDir = stats.isDirectory();
      this.log(`isFolder: ${filePath} ${isDir}`);
      return isDir;
    } catch (e) {
      console.log(`isFolder: error`, e);
      return false;
    }
  }

  isFile(filePath: string) {
    return !this.isFolder(filePath);
  }

  fileFilter(filePath: string) {
    return this.isValidTaskFileExt(filePath);
  }

  readFolders(filePath: string) {
    const isFolder = this.isFolder.bind(this);
    const files = fs.readdirSync(filePath);
    this.log(`readFolders: read ${files}`);
    const fullFilePaths = files.map((f) => path.join(filePath, f));
    return fullFilePaths.filter(isFolder);
  }

  readFiles(filePath: string) {
    return fs.readdirSync(filePath);
  }

  sortedFoldersFrom(filePath: string) {
    this.log(`sortedFoldersFrom: reading folders from ${filePath}`);
    const folders = this.readFolders(filePath);
    this.log(`sortedFoldersFrom: folders found ${folders}`);
    const orderedFolders = folders.sort((f1: string, f2: string) => {
      return this.indexOf(f1) <= this.indexOf(f2) ? 1 : 0;
    });
    this.ordering = orderedFolders;
    return orderedFolders;
  }
}
