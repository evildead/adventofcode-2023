/* eslint-disable security/detect-object-injection */
import { DanMatrix } from 'danmatrix';

export type AmountOfLoadPerLine = {
  numOfRoundedRocks: number;
  numOfRowsFromTheRockToTheSouthEdge: number;
  lineAmount: number;
};

export type TotalAmountOfLoad = {
  lines: Array<AmountOfLoadPerLine>;
  totalAmount: number;
};

export class ParabolicReflectorDish {
  private _parabolicReflectorMatrixOriginal: DanMatrix<string>;
  private _parabolicReflectorMatrixAfterTiltingLever: DanMatrix<string>;

  constructor(fileLines: Array<string>) {
    this.setupInput(fileLines);
  }

  private setupInput(fileLines: Array<string>) {
    this._parabolicReflectorMatrixOriginal = new DanMatrix<string>();
    for (let lineIndex = 0; lineIndex < fileLines.length; lineIndex++) {
      const trimmedLine = fileLines[lineIndex].trim();
      if (trimmedLine.length > 0) {
        this._parabolicReflectorMatrixOriginal.addRow(trimmedLine.split(''));
      }
    }
  }

  private makeTheRoundedRocksSlideNorthAsFarAsPossible() {
    this._parabolicReflectorMatrixAfterTiltingLever = this._parabolicReflectorMatrixOriginal.clone();
    // setup the queues for empty spaces for each matrix column
    const columnsQueuesForEmptySpaces: Array<Array<number>> = Array.from(
      { length: this._parabolicReflectorMatrixAfterTiltingLever.colsNum() },
      () => []
    );
    // loop through rows
    for (let rowIndex = 0; rowIndex < this._parabolicReflectorMatrixAfterTiltingLever.rowsNum(); rowIndex++) {
      const row = this._parabolicReflectorMatrixAfterTiltingLever.getRowAt(rowIndex);
      if (row === undefined) {
        continue;
      }
      // loop through row elements
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const element = row[colIndex];
        const currColumnQueue = columnsQueuesForEmptySpaces[colIndex];
        switch (element) {
          // The cube-shaped rock (#)
          case '#':
            // remove all elements from the empty spaces queue
            currColumnQueue.splice(0, currColumnQueue.length);
            break;
          // The rounded rock (O)
          case 'O':
            // there's at least an empty space to roll
            if (currColumnQueue.length > 0) {
              const emptyRowIndex = currColumnQueue.shift() as number;
              this._parabolicReflectorMatrixAfterTiltingLever.set(emptyRowIndex, colIndex, 'O');
              this._parabolicReflectorMatrixAfterTiltingLever.set(rowIndex, colIndex, '.');
              currColumnQueue.push(rowIndex);
            }
            break;
          // Empty space (.)
          default:
            currColumnQueue.push(rowIndex);
            break;
        }
      }
    }
    // console.log(this._parabolicReflectorMatrixOriginal.getMatrixString(3));
    // console.log(this._parabolicReflectorMatrixAfterTiltingLever.getMatrixString(3));
  }

  public computeLoadOfNorthSupportBeamsPart1(): TotalAmountOfLoad {
    this.makeTheRoundedRocksSlideNorthAsFarAsPossible();
    const res: TotalAmountOfLoad = {
      lines: [],
      totalAmount: 0
    };
    for (let rowIndex = 0; rowIndex < this._parabolicReflectorMatrixAfterTiltingLever.rowsNum(); rowIndex++) {
      const row = this._parabolicReflectorMatrixAfterTiltingLever.getRowAt(rowIndex);
      if (row === undefined) {
        continue;
      }
      const numOfRowsFromTheRockToTheSouthEdge = this._parabolicReflectorMatrixAfterTiltingLever.rowsNum() - rowIndex;
      // loop through row elements
      let numOfRoundedRocks = 0;
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const element = row[colIndex];
        if (element === 'O') {
          ++numOfRoundedRocks;
        }
      }
      const lineLoad: AmountOfLoadPerLine = {
        numOfRoundedRocks,
        numOfRowsFromTheRockToTheSouthEdge,
        lineAmount: numOfRoundedRocks * numOfRowsFromTheRockToTheSouthEdge
      };
      res.lines.push(lineLoad);
      res.totalAmount += lineLoad.lineAmount;
    }

    return res;
  }
}
