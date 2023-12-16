import { getAsciiArtLogger, getConsoleLogger } from './logger';
import { christmasTree } from './utilities';
import { startDay01 } from './day01';
import { startDay02 } from './day02';
import { startDay03 } from './day03';
import { startDay04 } from './day04';
import { startDay05 } from './day05';
import { startDay06 } from './day06';
import { startDay07 } from './day07';
import { startDay08 } from './day08';

const asciiArtLogger = getAsciiArtLogger('info', 'Digital');
const consoleLogger = getConsoleLogger('info');

asciiArtLogger.info('AdventOfCode-2023');

(async () => {
  startDay01();
  startDay02();
  startDay03();
  startDay04();
  startDay05();
  startDay06();
  startDay07();
  startDay08();
  consoleLogger.info(christmasTree(7));
})();
