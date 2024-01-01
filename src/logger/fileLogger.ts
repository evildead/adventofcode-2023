import * as fs from 'fs';
import { ILoggable } from './xlogger';

export class FileLogger implements ILoggable {
  protected _filePath: string;
  protected _fd: number;

  constructor(filePath: string) {
    this._filePath = filePath;
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    this._fd = fs.openSync(this._filePath, 'w');
  }

  log(msg: any): void {
    fs.writeSync(this._fd, `${msg}\r\n`);
  }
}
