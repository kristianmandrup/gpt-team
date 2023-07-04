import * as fs from 'fs';
import * as path from 'path';

export class FilePhaseHandler {
  protected ordering: any;

  indexof(folderPath: string): number {
    const fileName = path.parse(folderPath).name;
    return this.ordering.indexof(fileName);
  }

  // TODO: only folders
  fileFilter(file: string) {
    return this.indexof(file) >= 0;
  }

  readFiles(filePath: string) {
    return fs.readdirSync(filePath);
  }

  sortedFoldersFrom(filePath: string) {
    const files = this.readFiles(filePath);
    const useFolders = files.filter((f) => this.fileFilter(f));
    return useFolders.sort((f1: string, f2: string) => {
      return this.indexof(f1) <= this.indexof(f2) ? 1 : 0;
    });
  }
}
