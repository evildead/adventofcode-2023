import { ILoggable } from './xlogger';

export class ConsoleLogger implements ILoggable {
  log(msg: any): void {
    console.log(msg);
  }
}
