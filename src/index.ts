import { getAsciiArtLogger, getConsoleLogger } from './logger';
import { christmasTree } from './utilities';
import {
  startDay01,
  startDay02,
  startDay03,
  startDay04,
  startDay05,
  startDay06,
  startDay07,
  startDay08,
  startDay09,
  startDay10,
  startDay11,
  startDay12,
  startDay13,
  startDay14
} from './challenges';

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
  startDay09();
  startDay10();
  startDay11();
  startDay12();
  startDay13();
  startDay14();
  consoleLogger.info(christmasTree(7));
})();
