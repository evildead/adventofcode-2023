/* eslint-disable security/detect-object-injection */
import { getAsciiArtLogger, getConsoleLogger, getFileLogger } from '../logger';
import { getTextFileAsListOfLines, trimAny } from '../utilities';

/*
--- Day 3: Gear Ratios ---
You and the Elf eventually reach a gondola lift station; he says the
gondola lift will take you up to the water source, but this is as far as he
can bring you. You go inside.

It doesn't take long to find the gondolas, but there seems to be a problem:
they're not moving.

"Aaah!"

You turn around to see a slightly-greasy Elf with a wrench and a look of
surprise. "Sorry, I wasn't expecting anyone! The gondola lift isn't working right now;
it'll still be a while before I can fix it." You offer to help.

The engineer explains that an engine part seems to be missing from the engine,
but nobody can figure out which one. If you can add up all the part numbers in the engine schematic,
it should be easy to work out which part is missing.

The engine schematic (your puzzle input) consists of a visual representation of the engine.
There are lots of numbers and symbols you don't really understand, but apparently any number adjacent
to a symbol, even diagonally, is a "part number" and should be included in your sum.
(Periods (.) do not count as a symbol.)

Here is an example engine schematic:

467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..
In this schematic, two numbers are not part numbers because they are not adjacent to a symbol:
114 (top right) and 58 (middle right). Every other number is adjacent to a symbol and so is a part number;
their sum is 4361.

Of course, the actual engine schematic is much larger.
What is the sum of all of the part numbers in the engine schematic?

--- Part Two ---
The engineer finds the missing part and installs it in the engine! As the
engine springs to life, you jump in the closest gondola, finally ready to
ascend to the water source.

You don't seem to be going very fast, though. Maybe something is still wrong?
Fortunately, the gondola has a phone labeled "help", so you pick it up and the engineer answers.

Before you can explain the situation, she suggests that you look out the window.
There stands the engineer, holding a phone in one hand and waving with the other.
You're going so slowly that you haven't even left the station. You exit the gondola.

The missing part wasn't the only issue - one of the gears in the engine is wrong.
A gear is any * symbol that is adjacent to exactly two part numbers.
Its gear ratio is the result of multiplying those two numbers together.

This time, you need to find the gear ratio of every gear and add them all up so that
the engineer can figure out which gear needs to be replaced.

Consider the same engine schematic again:

467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..
In this schematic, there are two gears. The first is in the top left;
it has part numbers 467 and 35, so its gear ratio is 16345.
The second gear is in the lower right; its gear ratio is 451490.
(The * adjacent to 617 is not a gear because it is only adjacent to one part number.)
Adding up all of the gear ratios produces 467835.

What is the sum of all of the gear ratios in your engine schematic?
*/

export type PartNumbersResultType = {
  partNumbers: Array<[number, number, number]>;
  nonPartNumbers: Array<[number, number, number]>;
  total: number;
};

export enum ElementType {
  IsNumber = 1,
  IsSymbol = 2,
  IsOther = 3
}

class PartNumbersRetrieverSecondTry {
  private _mapOfElements: ElementType[][];
  private _engineByLines: Array<string>;

  constructor(engineByLines: Array<string>) {
    this.createMapOfElements(engineByLines);
  }

  private createMapOfElements(engineByLines: Array<string>) {
    this._mapOfElements = [];
    this._engineByLines = [];
    for (const line of engineByLines) {
      const trimmedLine = line.trim();
      this._engineByLines.push(trimmedLine);
      const currLine: Array<ElementType> = [];
      for (let index = 0; index < trimmedLine.length; index++) {
        const element = trimmedLine[index];
        if (element === '.') {
          currLine.push(ElementType.IsOther);
        } else if (element.charCodeAt(0) >= '0'.charCodeAt(0) && element.charCodeAt(0) <= '9'.charCodeAt(0)) {
          currLine.push(ElementType.IsNumber);
        } else {
          currLine.push(ElementType.IsSymbol);
        }
      }
      this._mapOfElements.push(currLine);
    }
  }

  get mapOfElements(): ElementType[][] {
    return this._mapOfElements;
  }

  public listPartNumbers(): Array<number> {
    const listOfPartNumbers: Array<number> = [];

    for (let lineIndex = 0; lineIndex < this._mapOfElements.length; lineIndex++) {
      // const lineIndex = 4;
      const currLine = this._engineByLines[lineIndex];
      const currMapOfElements = this._mapOfElements[lineIndex];
      let startCoordNum = 0;
      let endCoordNum = 0;
      let num = '';

      for (let index = 0; index < currMapOfElements.length; index++) {
        const element = currMapOfElements[index];
        if (element === ElementType.IsNumber) {
          if (num.length < 1) {
            startCoordNum = Number(index);
          }
          num += currLine[index];
          endCoordNum = Number(index);
        } else {
          if (num.length > 0) {
            // do the check for part number
            if (this.checkNumIsPartNumber(lineIndex, startCoordNum, endCoordNum)) {
              listOfPartNumbers.push(Number(num));
            }
            startCoordNum = 0;
            endCoordNum = 0;
            num = '';
          }
        }
      }
      if (num.length > 0) {
        // do the check for part number
        if (this.checkNumIsPartNumber(lineIndex, startCoordNum, endCoordNum)) {
          listOfPartNumbers.push(Number(num));
        }
        startCoordNum = 0;
        endCoordNum = 0;
        num = '';
      }
    }

    return listOfPartNumbers;
  }

  public checkNumIsPartNumber(line: number, startCoordNum: number, endCoordNum: number): boolean {
    // previous line
    const prevLine = line - 1;
    if (prevLine >= 0) {
      for (let colIndex = startCoordNum - 1; colIndex <= endCoordNum + 1; colIndex++) {
        if (colIndex >= 0 && colIndex < this._mapOfElements[prevLine].length) {
          if (this._mapOfElements[prevLine][colIndex] === ElementType.IsSymbol) {
            return true;
          }
        }
      }
    }

    // curr line
    if (startCoordNum - 1 >= 0 && this._mapOfElements[line][startCoordNum - 1] === ElementType.IsSymbol) {
      return true;
    }
    if (
      endCoordNum + 1 < this._mapOfElements[line].length &&
      this._mapOfElements[line][endCoordNum + 1] === ElementType.IsSymbol
    ) {
      return true;
    }

    // next line
    const succLine = line + 1;
    if (succLine < this._mapOfElements.length) {
      for (let colIndex = startCoordNum - 1; colIndex <= endCoordNum + 1; colIndex++) {
        if (colIndex >= 0 && colIndex < this._mapOfElements[succLine].length) {
          if (this._mapOfElements[succLine][colIndex] === ElementType.IsSymbol) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

class PartNumbersRetriever {
  /**
   * Engine line.
   * Example: "467..114.."
   */
  private _engineByLines: Array<string>;

  /**
   * ### Map of all the engine elements by lines
   * ```
   * {
   *   ...
   *   (Line-5): {
   *               (Column-0): ElementType.IsOther,
   *               (Column-1): ElementType.IsSymbol,
   *               (Column-2): ElementType.IsNumber,
   *               ...
   *             },
   *   ...
   * }
   * ```
   */
  private _mapEngineElements: Map<number, Map<number, ElementType>>;

  /**
   * ### Map of all the numbers by lines
   * #### Each number value will be stored with the related column list
   * ```
   * {
   *   ...
   *   (Line-7): {
   *               472: [5, 6, 7],
   *               931: [12, 13, 14],
   *               ...
   *             },
   *   ...
   * }
   * ```
   */
  private _mapNumbers: Map<number, Map<number, Array<number>>>;

  constructor(engineByLines: Array<string>) {
    this.setupInput(engineByLines);
  }

  private setupInput(engineByLines: Array<string>) {
    this._engineByLines = [];
    this._mapEngineElements = new Map<number, Map<number, ElementType>>();
    this._mapNumbers = new Map<number, Map<number, Array<number>>>();
    for (let lineIndex = 0; lineIndex < engineByLines.length; ++lineIndex) {
      // const engineLine = trimAny(engineByLines[lineIndex], '\r\n\t\v ');
      const engineLine = engineByLines[lineIndex].trim();
      const engineColMap = new Map<number, ElementType>();
      const engineNumbersMap = new Map<number, Array<number>>();
      this._mapEngineElements.set(lineIndex, engineColMap);
      this._mapNumbers.set(lineIndex, engineNumbersMap);
      this._engineByLines.push(engineLine);
      let tmpNumber = '';
      let tmpNumberCols: Array<number> = [];
      for (let colIndex = 0; colIndex < engineLine.length; ++colIndex) {
        const engineElement = engineLine[colIndex];
        if (engineElement === '.') {
          engineColMap.set(colIndex, ElementType.IsOther);
          if (tmpNumberCols.length > 0) {
            engineNumbersMap.set(Number(tmpNumber), [...tmpNumberCols]);
            tmpNumber = '';
            tmpNumberCols = [];
          }
        } else if (!isNaN(engineElement as any)) {
          engineColMap.set(colIndex, ElementType.IsNumber);
          tmpNumber += engineElement;
          tmpNumberCols.push(colIndex);
        } else {
          engineColMap.set(colIndex, ElementType.IsSymbol);
          if (tmpNumberCols.length > 0) {
            engineNumbersMap.set(Number(tmpNumber), [...tmpNumberCols]);
            tmpNumber = '';
            tmpNumberCols = [];
          }
        }
      }
      if (tmpNumberCols.length > 0) {
        engineNumbersMap.set(Number(tmpNumber), [...tmpNumberCols]);
        tmpNumber = '';
        tmpNumberCols = [];
      }
    }
  }

  private isCoordinateAdjacentToSymbol({
    lineNumber,
    columnNumber
  }: {
    lineNumber: number;
    columnNumber: number;
  }): boolean {
    for (let lineIndex = lineNumber - 1; lineIndex <= lineNumber + 1; ++lineIndex) {
      const line = this._mapEngineElements.get(lineIndex);
      if (line) {
        for (let col = columnNumber - 1; col <= columnNumber + 1; ++col) {
          const elem = line.get(col);
          if (elem === ElementType.IsSymbol) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private mapEngineNumbersToObj() {
    const outObj: any = {};
    for (const [lineIndex, engineNumbersMap] of this._mapNumbers.entries()) {
      outObj[lineIndex] = Array.from(engineNumbersMap);
    }
    return outObj;
  }

  private mapEngineElementsToObj() {
    const outObj: any = {};
    for (const [lineIndex, engineElementsColMap] of this._mapEngineElements.entries()) {
      outObj[lineIndex] = Array.from(engineElementsColMap);
    }
    return outObj;
  }

  public computePartNumbersSumPart1(): PartNumbersResultType {
    const partNumbersResult: PartNumbersResultType = {
      partNumbers: [],
      nonPartNumbers: [],
      total: 0
    };
    for (const [lineIndex, engineNumbersMap] of this._mapNumbers.entries()) {
      if (engineNumbersMap) {
        for (const [num, colsOfNum] of engineNumbersMap.entries()) {
          let foundAdjacentToSymbol = false;
          for (const colIndex of colsOfNum) {
            if (
              this.isCoordinateAdjacentToSymbol({
                lineNumber: lineIndex,
                columnNumber: colIndex
              })
            ) {
              partNumbersResult.partNumbers.push([num, lineIndex, colsOfNum[0]]);
              partNumbersResult.total += num;
              foundAdjacentToSymbol = true;
              break;
            }
          }
          if (!foundAdjacentToSymbol) {
            partNumbersResult.nonPartNumbers.push([num, lineIndex, colsOfNum[0]]);
          }
        }
      }
    }
    // fileLogger.debug(`EngineMap: ${JSON.stringify(this.mapEngineElementsToObj(), null, 2)}`);
    // fileLogger.debug(`EngineNumbers: ${JSON.stringify(this.mapEngineNumbersToObj(), null, 2)}`);
    return partNumbersResult;
  }
}

export function sumOfAllPartNumbers(filePath: string): PartNumbersResultType {
  const engineByLinesLines = getTextFileAsListOfLines(filePath);
  const partNumbersRetriever = new PartNumbersRetriever(engineByLinesLines);
  const result = partNumbersRetriever.computePartNumbersSumPart1();
  return result;
}

export function sumOfAllPartNumbersSecondTry(filePath: string): number[] {
  const engineByLinesLines = getTextFileAsListOfLines(filePath);
  const partNumbersRetrieverSecondTry = new PartNumbersRetrieverSecondTry(engineByLinesLines);
  const result = partNumbersRetrieverSecondTry.listPartNumbers();
  return result;
}

export function startDay03() {
  const asciiArtLogger = getAsciiArtLogger('debug', 'Doom');
  const consoleLogger = getConsoleLogger('debug');
  asciiArtLogger.info('Day 3');

  // PART 1
  // const resPart1 = sumOfAllPartNumbers('data/day03/testInput01.txt');
  // const resPart1 = sumOfAllPartNumbers('data/day03/input01.txt');
  // consoleLogger.debug(`PART 1:\n${JSON.stringify(resPart1, null, 2)}`);
  // consoleLogger.info(`PART 1: ${resPart1.total}`);

  /*
  let tot = 0;
  let ntot = 0;
  for (const partNumber of resPart1.partNumbers) {
    tot += partNumber[0];
  }
  consoleLogger.info(`tot: ${tot}`);
  for (const nonPartNumber of resPart1.nonPartNumbers) {
    ntot += nonPartNumber[0];
  }
  consoleLogger.info(`ntot: ${ntot}`);
  */

  // const secondTryPart1 = sumOfAllPartNumbersSecondTry('data/day03/testInput01.txt');
  const secondTryPart1 = sumOfAllPartNumbersSecondTry('data/day03/input01.txt');
  const sumPartNumbers = secondTryPart1.reduce((a, b) => {
    return a + b;
  });
  consoleLogger.debug(`PART 1:\n${JSON.stringify(secondTryPart1)}`);
  consoleLogger.info(`PART 1: ${sumPartNumbers}`);

  // PART 2
}

/*
(() => {
  startDay03();
})();
*/
