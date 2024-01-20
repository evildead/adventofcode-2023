/* eslint-disable security/detect-object-injection */
import { DanMatrix } from 'danmatrix';

export enum LineOfReflectionType {
  row = 'row',
  column = 'column'
}

export type LineOfReflection = {
  lorType: LineOfReflectionType;
  lorBoundaryIndexes: [number, number];
};

export type LineOfReflectionForPatternResponse = {
  lor: LineOfReflection;
  lorScore: number;
};

export type LinesOfReflectionTotalScoreResponse = {
  patternScores: Array<LineOfReflectionForPatternResponse>;
  totalScore: number;
};

export class LinesOfReflection {
  private _patterns: Array<DanMatrix<string>>;

  constructor(fileLines: Array<string>) {
    this.setupInput(fileLines);
  }

  private setupInput(fileLines: Array<string>) {
    this._patterns = [];
    let currPatternIndex = 0;
    for (let lineIndex = 0; lineIndex < fileLines.length; lineIndex++) {
      if (this._patterns[currPatternIndex] === undefined) {
        this._patterns[currPatternIndex] = new DanMatrix<string>();
      }
      const trimmedLine = fileLines[lineIndex].trim();
      if (trimmedLine.length > 0) {
        this._patterns[currPatternIndex].addRow(trimmedLine.split(''));
      } else {
        currPatternIndex++;
      }
    }
  }

  private static getLineOfReflectionForPattern(pattern: DanMatrix<string>): LineOfReflectionForPatternResponse {
    const resDefault: LineOfReflectionForPatternResponse = {
      lor: {
        lorType: LineOfReflectionType.row,
        lorBoundaryIndexes: [-1, -1]
      },
      lorScore: 0
    };
    const lorFound: Array<LineOfReflectionForPatternResponse> = [];
    // check rows
    const rowsMap: Map<string, Array<number>> = new Map<string, Array<number>>();
    for (let rowIndex = 0; rowIndex < pattern.rowsNum(); rowIndex++) {
      const row = pattern.getRowAt(rowIndex);
      if (row !== undefined) {
        const stringifiedRow = row.join('');
        if (rowsMap.has(stringifiedRow)) {
          const arrayOfIndexes = rowsMap.get(stringifiedRow) as number[];
          arrayOfIndexes.push(rowIndex);
        } else {
          rowsMap.set(stringifiedRow, [rowIndex]);
        }
      }
    }
    for (const [, indexList] of rowsMap) {
      if (indexList.length < 2) {
        continue;
      }
      const orderedIndexList = indexList.sort((a, b) => a - b);
      for (let i = 0; i < orderedIndexList.length - 1; i++) {
        // check consecutive indexes
        if (orderedIndexList[i + 1] - orderedIndexList[i] === 1) {
          const lor: LineOfReflection = {
            lorType: LineOfReflectionType.row,
            lorBoundaryIndexes: [orderedIndexList[i], orderedIndexList[i + 1]]
          };
          const checkLineOfReflectionRes = LinesOfReflection.checkLineOfReflection(pattern, lor);
          // found line of reflection
          if (checkLineOfReflectionRes) {
            lorFound.push({
              lor,
              lorScore: (lor.lorBoundaryIndexes[0] + 1) * 100
            });
          }
        }
      }
    }
    // check columns
    const columnsMap: Map<string, Array<number>> = new Map<string, Array<number>>();
    for (let colIndex = 0; colIndex < pattern.colsNum(); colIndex++) {
      const column = pattern.getColumnAt(colIndex);
      if (column !== undefined) {
        const stringifiedCol = column.join('');
        if (columnsMap.has(stringifiedCol)) {
          const arrayOfIndexes = columnsMap.get(stringifiedCol) as number[];
          arrayOfIndexes.push(colIndex);
        } else {
          columnsMap.set(stringifiedCol, [colIndex]);
        }
      }
    }
    for (const [, indexList] of columnsMap) {
      if (indexList.length < 2) {
        continue;
      }
      const orderedIndexList = indexList.sort((a, b) => a - b);
      for (let i = 0; i < orderedIndexList.length - 1; i++) {
        // check consecutive indexes
        if (orderedIndexList[i + 1] - orderedIndexList[i] === 1) {
          const lor: LineOfReflection = {
            lorType: LineOfReflectionType.column,
            lorBoundaryIndexes: [orderedIndexList[i], orderedIndexList[i + 1]]
          };
          const checkLineOfReflectionRes = LinesOfReflection.checkLineOfReflection(pattern, lor);
          // found line of reflection
          if (checkLineOfReflectionRes) {
            lorFound.push({
              lor,
              lorScore: lor.lorBoundaryIndexes[0] + 1
            });
          }
        }
      }
    }
    if (lorFound.length > 1) {
      console.log(`Found more than 1 lor: ${JSON.stringify(lorFound, null, 2)}\n${pattern.getMatrixString(3)}`);
    }
    if (lorFound.length < 1) {
      return resDefault;
    }
    return lorFound[0];
  }

  private static checkLineOfReflection(pattern: DanMatrix<string>, lor: LineOfReflection): boolean {
    switch (lor.lorType) {
      // column
      case LineOfReflectionType.column: {
        let leftIndex = lor.lorBoundaryIndexes[0];
        let rightIndex = lor.lorBoundaryIndexes[1];
        while (leftIndex >= 0 && rightIndex < pattern.colsNum()) {
          const leftColumn = pattern.getColumnAt(leftIndex);
          const rightColumn = pattern.getColumnAt(rightIndex);
          if (leftColumn === undefined || rightColumn === undefined) {
            return false;
          }
          if (leftColumn.join('') !== rightColumn.join('')) {
            return false;
          }
          --leftIndex;
          ++rightIndex;
        }
        return true;
      }
      // row
      default: {
        let aboveIndex = lor.lorBoundaryIndexes[0];
        let belowIndex = lor.lorBoundaryIndexes[1];
        while (aboveIndex >= 0 && belowIndex < pattern.rowsNum()) {
          const aboveColumn = pattern.getRowAt(aboveIndex);
          const belowColumn = pattern.getRowAt(belowIndex);
          if (aboveColumn === undefined || belowColumn === undefined) {
            return false;
          }
          if (aboveColumn.join('') !== belowColumn.join('')) {
            return false;
          }
          --aboveIndex;
          ++belowIndex;
        }
        return true;
      }
    }
  }

  public computeLinesOfReflectionScorePart1(): LinesOfReflectionTotalScoreResponse {
    const res: LinesOfReflectionTotalScoreResponse = {
      patternScores: [],
      totalScore: 0
    };
    for (const pattern of this._patterns) {
      const lorResponse = LinesOfReflection.getLineOfReflectionForPattern(pattern);
      res.patternScores.push(lorResponse);
      res.totalScore += lorResponse.lorScore;
    }
    return res;
  }
}
