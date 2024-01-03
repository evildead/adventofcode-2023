import { getAsciiArtLogger, getConsoleLogger } from '../../logger';
import { getTextFileAsListOfLines, trimAny } from '../../utilities';

/*
--- Day 1: Trebuchet?! ---
Something is wrong with global snow production, and you've been selected to take a look.
The Elves have even given you a map; on it, they've used stars to mark the top fifty locations that are likely to be having problems.

You've been doing this long enough to know that to restore snow operations, you need to check all fifty stars by December 25th.

Collect stars by solving puzzles. Two puzzles will be made available on each day in the Advent calendar;
the second puzzle is unlocked when you complete the first. Each puzzle grants one star. Good luck!

You try to ask why they can't just use a weather machine ("not powerful enough") and where they're even sending you ("the sky")
and why your map looks mostly blank ("you sure ask a lot of questions") and hang on did you just say the sky ("of course,
where do you think snow comes from") when you realize that the Elves are already loading you into a trebuchet
("please hold still, we need to strap you in").

As they're making the final adjustments, they discover that their calibration document (your puzzle input) has been amended
by a very young Elf who was apparently just excited to show off her art skills. Consequently,
the Elves are having trouble reading the values on the document.

The newly-improved calibration document consists of lines of text; each line originally contained a specific calibration value
that the Elves now need to recover. On each line, the calibration value can be found by combining the first digit and the last
digit (in that order) to form a single two-digit number.

For example:

1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet
In this example, the calibration values of these four lines are 12, 38, 15, and 77. Adding these together produces 142.

Consider your entire calibration document. What is the sum of all of the calibration values?

--- Part Two ---
Your calculation isn't quite right. It looks like some of the digits are actually spelled out with letters:
one, two, three, four, five, six, seven, eight, and nine also count as valid "digits".

Equipped with this new information, you now need to find the real first and last digit on each line. For example:

two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen
In this example, the calibration values are 29, 83, 13, 24, 42, 14, and 76. Adding these together produces 281.

What is the sum of all of the calibration values?
*/

export type CalibrationItemType = {
  calibrationLine: string;
  stringValue: string;
  numericValue: number;
};

export type CalibrationResultType = {
  calibrationLines: Array<CalibrationItemType>;
  total: number;
};

function getValuesFromCalibrationLinePart1(calibrationLine: string): [string, number] {
  let firstDigit: string = '';
  let lastDigit: string = '';
  for (const currChar of calibrationLine) {
    if (currChar.charCodeAt(0) >= '0'.charCodeAt(0) && currChar.charCodeAt(0) <= '9'.charCodeAt(0)) {
      if (firstDigit.length < 1) {
        firstDigit = currChar;
      }
      lastDigit = currChar;
    }
  }
  const stringValue = `${firstDigit}${lastDigit}`;
  const numericValue = stringValue.length > 0 ? Number(stringValue) : 0;

  return [stringValue, numericValue];
}

function getValuesFromCalibrationLinePart2(calibrationLine: string): [string, number] {
  let firstDigit: string = '';
  let lastDigit: string = '';
  let m: RegExpExecArray | null;
  const matchToDigit = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9'
  };
  // a positive lookahead with a capturing group for overlapping matches
  // example: '9fgsixzkbscvbxdsfive6spjfhzxbzvgbvrthreeoneightn'
  const regex = /[0-9]|(?=(one)|(two)|(three)|(four)|(five)|(six)|(seven)|(eight)|(nine))/gm;

  while ((m = regex.exec(calibrationLine)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match) => {
      if (!match) {
        return;
      }
      if (firstDigit.length < 1) {
        // eslint-disable-next-line security/detect-object-injection
        firstDigit = matchToDigit[match];
      }
      // eslint-disable-next-line security/detect-object-injection
      lastDigit = matchToDigit[match];
    });
  }

  const stringValue = `${firstDigit}${lastDigit}`;
  const numericValue = stringValue.length > 0 ? Number(stringValue) : 0;

  return [stringValue, numericValue];
}

export function sumOfCalibrations(
  filePath: string,
  strategy: (calibrationLine: string) => [string, number]
): CalibrationResultType {
  const calibrationLines = getTextFileAsListOfLines(filePath);
  const result: CalibrationResultType = {
    calibrationLines: [],
    total: 0
  };
  for (const calibrationLine of calibrationLines) {
    const trimmedCalibrationLine = trimAny(calibrationLine, '\r\n\t\v');
    const [stringValue, numericValue] = strategy(trimmedCalibrationLine);
    result.calibrationLines.push({
      calibrationLine: trimmedCalibrationLine,
      stringValue,
      numericValue
    });
    result.total += numericValue;
  }
  return result;
}

export function startDay01() {
  const asciiArtLogger = getAsciiArtLogger('debug', 'Doom');
  const consoleLogger = getConsoleLogger('debug');
  asciiArtLogger.info('Day 1');

  // PART 1
  // const resPart1 = sumOfCalibrations('data/day01/testInput01.txt', getValuesFromCalibrationLinePart1);
  const resPart1 = sumOfCalibrations('data/day01/input01.txt', getValuesFromCalibrationLinePart1);
  consoleLogger.debug(`PART 1:\n${JSON.stringify(resPart1, null, 2)}`);
  consoleLogger.info(`PART 1: ${resPart1.total}`);

  // PART 2
  // const resPart2 = sumOfCalibrations('data/day01/testInput02.txt', getValuesFromCalibrationLinePart2);
  const resPart2 = sumOfCalibrations('data/day01/input01.txt', getValuesFromCalibrationLinePart2);
  consoleLogger.debug(`PART 2:\n${JSON.stringify(resPart2, null, 2)}`);
  consoleLogger.info(`PART 2: ${resPart2.total}`);
}

/*
(() => {
  startDay01();
})();
*/
