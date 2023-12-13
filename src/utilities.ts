import { readFileSync } from 'fs';

export function getTextFileAsListOfLines(filePath: string): Array<string> {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return readFileSync(filePath).toString('utf-8').split('\n');
}

export function trimAny(str: string, chars: string) {
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
  return (num & 1) === 0;
}

export function isOdd(num: number) {
  return (num & 1) === 1;
}
