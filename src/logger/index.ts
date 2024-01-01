import figlet from 'figlet';
import { Xlogger, LogLevel } from './xlogger';
import { AsciiArtLogger } from './asciiArtLogger';
import { ConsoleLogger } from './consoleLogger';
import { FileLogger } from './fileLogger';

let xloggerAsciiArt: Xlogger;
let xloggerConsole: Xlogger;
let xloggerFile: Xlogger;

export function availableFonts(printFonts: boolean = true) {
  const figletFonts = figlet.fontsSync();
  if (printFonts) {
    for (const figletFont of figletFonts) {
      const figletText = figlet.textSync('AdventOfCode-2023', figletFont);
      console.log(
        `${figletFont}\n${figletText}\n---------------------------------------------------------------------------------------------------`
      );
    }
  }
  return figletFonts;
}

export function getAsciiArtLogger(logLevel: LogLevel = 'info', font?: figlet.Fonts): Xlogger {
  if (!xloggerAsciiArt) {
    const desiredFont = font ?? 'Doom';
    const figletFonts = availableFonts(false);
    const asciiArtLogger = new AsciiArtLogger(figletFonts.includes(desiredFont) ? desiredFont : undefined);
    xloggerAsciiArt = new Xlogger(logLevel, [asciiArtLogger]);
  }
  return xloggerAsciiArt;
}

export function getConsoleLogger(logLevel: LogLevel = 'info'): Xlogger {
  if (!xloggerConsole) {
    const consoleLogger = new ConsoleLogger();
    xloggerConsole = new Xlogger(logLevel, [consoleLogger]);
  }
  return xloggerConsole;
}

export function getFileLogger(logLevel: LogLevel = 'info', filePath: string): Xlogger {
  if (!xloggerFile) {
    const fileLogger = new FileLogger(filePath);
    xloggerFile = new Xlogger(logLevel, [fileLogger]);
  }
  return xloggerFile;
}
