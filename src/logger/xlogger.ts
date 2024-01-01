export type LogLevel = 'error' | 'warning' | 'info' | 'debug';

export interface ILoggable {
  log: (msg: string) => void;
}

export class Xlogger {
  public _loggables: ILoggable[];
  public _logLevel: LogLevel;

  constructor(logLevel: LogLevel, loggables?: ILoggable[]) {
    this._logLevel = logLevel;
    this._loggables = loggables || [];
  }

  public log(logLevel: LogLevel, msg: any) {
    if (this._canILog(logLevel)) {
      this._loggables.forEach((loggable) => {
        // loggable.log(`${logLevel} - ${msg}`);
        loggable.log(msg);
      });
    }
  }

  public debug(msg: any) {
    return this.log('debug', msg);
  }

  public info(msg: any) {
    return this.log('info', msg);
  }

  public warning(msg: any) {
    return this.log('warning', msg);
  }

  public error(msg: any) {
    return this.log('error', msg);
  }

  private _canILog(logLevel: LogLevel): boolean {
    if (this._logLevel === 'debug') {
      return true;
    } else if (this._logLevel === 'info') {
      if (logLevel === 'debug') {
        return false;
      } else {
        return true;
      }
    } else if (this._logLevel === 'warning') {
      if (logLevel === 'debug' || logLevel === 'info') {
        return false;
      } else {
        return true;
      }
    } else {
      if (logLevel === 'error') {
        return true;
      } else {
        return false;
      }
    }
  }
}
