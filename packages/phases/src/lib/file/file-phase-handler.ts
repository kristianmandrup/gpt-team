import * as fs from 'fs';
import * as path from 'path';

export class FilePhaseHandler {
  public folders: string[] = [];
  public ordering: string[] = [];
  public ignore: string[] = [];
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

  validFileFilter(filePath: string) {
    return this.isValidTaskFileExt(filePath);
  }

  readFolders(filePath: string) {
    const isFolder = this.isFolder.bind(this);
    const files = fs.readdirSync(filePath);
    const fullFilePaths = files.map((f) => path.join(filePath, f));
    return fullFilePaths.filter(isFolder);
  }

  readFiles(filePath: string) {
    const isFile = this.isFile.bind(this);
    const files = fs.readdirSync(filePath);
    const fullFilePaths = files.map((f) => path.join(filePath, f));
    const validFileFilter = this.validFileFilter.bind(this);
    return fullFilePaths.filter(isFile).filter(validFileFilter);
  }

  ignoreFolders() {
    if (this.ignore.length == 0) return this.folders;
    return this.folders.filter((f) => this.ignore.includes(path.parse(f).name));
  }

  orderedFolders() {
    if (this.ordering.length == 0) return this.folders;
    return this.folders.sort((f1: string, f2: string) => {
      return this.indexOf(f1) <= this.indexOf(f2) ? 1 : 0;
    });
  }

  foldersFrom(filePath: string) {
    this.log(`sortedFoldersFrom: reading folders from ${filePath}`);
    const folders = this.readFolders(filePath);
    this.folders = folders;
    this.log(`foldersFrom: folders found ${folders}`);
    this.folders = this.ignoreFolders();
    this.log(`foldersFrom: keep ${folders}`);
    this.folders = this.orderedFolders();
    this.log(`foldersFrom: ordered ${folders}`);
    return this.folders;
  }
}
