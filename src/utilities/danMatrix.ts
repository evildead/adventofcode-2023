/* eslint-disable security/detect-object-injection */
import _ from 'lodash';

export interface RowsColsFilledWithValType<T> {
  rows: number;
  columns: number;
  val: T;
}

export type DanMatrixConstructorType<T> = RowsColsFilledWithValType<T> | Array<Array<T>>;

export class DanMatrix<T> {
  private _2dvector: Array<Array<T>>;

  constructor(props?: DanMatrixConstructorType<T>) {
    this.setupMatrix(props);
  }

  public setupMatrix(props?: DanMatrixConstructorType<T>) {
    this._2dvector = [];
    if (props) {
      if (Array.isArray(props)) {
        let prevRowLength: number | undefined;
        for (const row of props) {
          if (!Array.isArray(row) || row.length < 1 || (prevRowLength !== undefined && prevRowLength !== row.length)) {
            throw new Error('Wrong input');
          }
          this._2dvector.push(row);
          prevRowLength = row.length;
        }
      } else {
        if (!_.isInteger(props.rows) || !_.isInteger(props.columns) || props.rows <= 0 || props.columns <= 0) {
          throw new Error('Wrong input');
        }
        for (let i = 0; i < props.rows; i++) {
          this._2dvector.push(Array.from({ length: props.columns }, () => props.val));
        }
      }
    }
  }

  public getMatrixString(fixedSpacing: number = 15): string {
    let outStr = '';
    for (let rowIndex = 0; rowIndex < this._2dvector.length; rowIndex++) {
      const row = this._2dvector[rowIndex];
      let rowStr = '┃';
      for (const value of row) {
        let valStr = ` ${value}`;
        if (_.isString(value) || _.isNumber(value)) {
          const missingSpaces = fixedSpacing - valStr.length;
          if (missingSpaces > 0) {
            valStr += `${' '.repeat(missingSpaces)}`;
          }
        }
        rowStr += `${valStr} ┃`;
      }
      if (rowIndex === 0) {
        outStr += `┏${'-'.repeat(rowStr.length - 2)}┓\n`;
      }
      outStr += `${rowStr}\n┣${'-'.repeat(rowStr.length - 2)}┫\n`;
    }
    return outStr;
  }

  public rowsNum(): number {
    return this._2dvector.length;
  }

  public colsNum(): number {
    if (this._2dvector.length < 1) {
      return 0;
    }
    return this._2dvector[0].length;
  }

  public get(x: number, y: number): T | undefined {
    return this._2dvector[x]?.[y];
  }

  public set(x: number, y: number, val: T): T | undefined {
    if (x >= this._2dvector.length || y >= this._2dvector[x].length) {
      return undefined;
    }
    this._2dvector[x][y] = val;
    return val;
  }

  public getCoord(coord: string): T | undefined {
    const coords = coord.split('-').map((elem: string) => Number(elem.trim()));
    if (coords.length < 2) {
      return undefined;
    }
    return this.get(coords[0], coords[1]);
  }

  public setCoord(coord: string, val: T): T | undefined {
    const coords = coord.split('-').map((elem: string) => Number(elem.trim()));
    if (coords.length < 2) {
      return undefined;
    }
    return this.set(coords[0], coords[1], val);
  }

  public addRow(row: Array<T>): void {
    if (!Array.isArray(row) || row.length < 1) {
      throw new Error('Wrong input');
    }
    if (this._2dvector.length > 0 && row.length !== this._2dvector[0].length) {
      throw new Error(
        `Input row's length ${row.length}, differs from matrix's num of columns ${this._2dvector[0].length}`
      );
    }
    this._2dvector.push(row);
  }

  public addColumn(column: Array<T>): void {
    if (!Array.isArray(column) || column.length < 1) {
      throw new Error('Wrong input');
    }
    if (this._2dvector.length > 0) {
      if (column.length !== this._2dvector.length) {
        throw new Error(
          `Input column's length ${column.length}, differs from matrix's num of rows ${this._2dvector.length}`
        );
      }
      for (let rowIndex = 0; rowIndex < this._2dvector.length; rowIndex++) {
        const row = this._2dvector[rowIndex];
        row.push(column[rowIndex]);
      }
    } else {
      for (const columnElement of column) {
        this._2dvector.push([columnElement]);
      }
    }
  }

  public lookForValue(val: T): Array<string> {
    const coordsArray: Array<string> = [];
    for (let rowIndex = 0; rowIndex < this._2dvector.length; rowIndex++) {
      const row = this._2dvector[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const element = row[colIndex];
        if (element === val) {
          coordsArray.push(`${rowIndex}-${colIndex}`);
        }
      }
    }
    return coordsArray;
  }
}
