import { getTextFileAsListOfLines, trimAny } from '../../utilities';

export type CalibrationItemType = {
  calibrationLine: string;
  stringValue: string;
  numericValue: number;
};

export type CalibrationResultType = {
  calibrationLines: Array<CalibrationItemType>;
  total: number;
};

export function getValuesFromCalibrationLinePart1(calibrationLine: string): [string, number] {
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

export function getValuesFromCalibrationLinePart2(calibrationLine: string): [string, number] {
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
