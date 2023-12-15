import { readFileSync } from 'fs';
import _ from 'lodash';

export function getTextFileAsListOfLines(filePath: string): Array<string> {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return readFileSync(filePath).toString('utf-8').split('\n');
}

export function trimAny(str: string, chars: string): string {
  if (!_.isString(str) || !_.isString(chars)) {
    return '';
  }
  let start = 0;
  let end = str.length;

  // eslint-disable-next-line security/detect-object-injection
  while (start < end && chars.indexOf(str[start]) >= 0) {
    ++start;
  }

  while (end > start && chars.indexOf(str[end - 1]) >= 0) {
    --end;
  }

  return start > 0 || end < str.length ? str.substring(start, end) : str;
}

function getNTimesStr(c: string, n: number): string {
  let str = '';
  for (let i = 0; i < n; ++i) {
    str = str + c;
  }
  return str;
}

export function christmasTree(n: number): string {
  let stringifiedChristmasTree = '';
  for (let line = 1; line <= n; ++line) {
    stringifiedChristmasTree += `${getNTimesStr(' ', n - line)}${getNTimesStr('*', 2 * line - 1)}\n`;
  }
  return stringifiedChristmasTree;
}

export function jsonStringifyReplacerForMapObjects(key: string, value: any): any {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries())
    };
  } else {
    return value;
  }
}

export function jsonParseReviverForMapObjects(key: string, value: any): any {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

export function isEven(num: number) {
  if (!_.isInteger(num)) {
    return false;
  }
  return (num & 1) === 0;
}

export function isOdd(num: number) {
  if (!_.isInteger(num)) {
    return false;
  }
  return (num & 1) === 1;
}

export type HighestLowestMapEntriesType<T> = {
  highest: [T, number];
  lowest: [T, number];
};

export function getHighestAndLowestMapEntries<T>(mapInput: Map<T, number>): HighestLowestMapEntriesType<T> | undefined {
  let highestEntry: [T, number] | undefined;
  let lowestEntry: [T, number] | undefined;

  if (
    !mapInput ||
    typeof mapInput !== 'object' ||
    typeof mapInput[Symbol.iterator] !== 'function' ||
    !('size' in mapInput) ||
    mapInput.size < 1
  ) {
    return undefined;
  }

  for (const [key, val] of mapInput) {
    if (highestEntry === undefined || val > highestEntry[1]) {
      highestEntry = [key, val];
    }
    if (lowestEntry === undefined || val < lowestEntry[1]) {
      lowestEntry = [key, val];
    }
  }

  if (highestEntry === undefined || lowestEntry === undefined) {
    return undefined;
  }

  return {
    highest: highestEntry,
    lowest: lowestEntry
  };
}
