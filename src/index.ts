import { getAsciiArtLogger, getConsoleLogger } from './logger';
import { christmasTree } from './utilities';
import { startDay01 } from './day01';
import { startDay02 } from './day02';
import { startDay03 } from './day03';

const asciiArtLogger = getAsciiArtLogger('info', 'Digital');
const consoleLogger = getConsoleLogger('info');

asciiArtLogger.info('AdventOfCode-2023');

(async () => {
  startDay01();
  startDay02();
  startDay03();
  consoleLogger.info(christmasTree(7));
})();
