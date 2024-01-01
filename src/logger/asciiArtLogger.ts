import { ILoggable } from './xlogger';
import figlet from 'figlet';

export class AsciiArtLogger implements ILoggable {
  protected _font: figlet.Fonts | undefined;

  constructor(font?: figlet.Fonts) {
    this._font = font;
  }

  log(msg: any): void {
    const fString = figlet.textSync(msg, this._font);
    console.log(fString);
  }
}
