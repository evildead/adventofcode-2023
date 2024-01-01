/* eslint-disable security/detect-object-injection */
import { DanMatrix } from '../utilities';

export type GalaxiesDistancesResponseType = {
  distancesMatrix: DanMatrix<number>;
  sumOfDistances: number;
};

export class Galaxies {
  private _galaxiesMatrix: DanMatrix<string>;

  private _distancesMatrix: DanMatrix<number>;

  constructor(fileLines: Array<string>) {
    this.setupInput(fileLines);
  }

  private setupInput(fileLines: Array<string>) {
    // populate the galaxies matrix
    this._galaxiesMatrix = new DanMatrix<string>();
    for (let lineIndex = 0; lineIndex < fileLines.length; lineIndex++) {
      const trimmedLine = fileLines[lineIndex].trim();
      if (trimmedLine.length > 0) {
        this._galaxiesMatrix.addRow(trimmedLine.split(''));
      }
    }
    // expand rows and columns not containing galaxies
    const galaxiesCoords = this._galaxiesMatrix.lookForValue('#');
    // rows to expand
    const rowsToExpand: Set<number> = new Set<number>(
      Array.from({ length: this._galaxiesMatrix.rowsNum() }, (v: unknown, k: number) => k)
    );
    // columns to expand
    const columnsToExpand: Set<number> = new Set<number>(
      Array.from({ length: this._galaxiesMatrix.colsNum() }, (v: unknown, k: number) => k)
    );
    for (const coord of galaxiesCoords) {
      const coordsSplitted = coord.split('-');
      rowsToExpand.delete(Number(coordsSplitted[0]));
      columnsToExpand.delete(Number(coordsSplitted[1]));
    }

    const rowsIndexHighestToLowest = Array.from(rowsToExpand.values()).reverse();
    for (let rowIndex = 0; rowIndex < rowsIndexHighestToLowest.length; rowIndex++) {
      const index = rowsIndexHighestToLowest[rowIndex];
      this._galaxiesMatrix.insertRowAt(
        index,
        Array.from({ length: this._galaxiesMatrix.colsNum() }, () => '.')
      );
    }

    const columnsIndexHighestToLowest = Array.from(columnsToExpand.values()).reverse();
    for (let columnIndex = 0; columnIndex < columnsIndexHighestToLowest.length; columnIndex++) {
      const index = columnsIndexHighestToLowest[columnIndex];
      this._galaxiesMatrix.insertColumnAt(
        index,
        Array.from({ length: this._galaxiesMatrix.rowsNum() }, () => '.')
      );
    }

    // console.log(this._galaxiesMatrix.getMatrixString(2));
  }

  private computeGalaxiesDistances() {
    const mapLabelCoord: Map<number, string> = new Map<number, string>();
    const galaxiesCoords = this._galaxiesMatrix.lookForValue('#');
    for (let coordIndex = 0; coordIndex < galaxiesCoords.length; coordIndex++) {
      const coord = galaxiesCoords[coordIndex];
      mapLabelCoord.set(coordIndex, coord);
      this._galaxiesMatrix.setCoord(coord, `${coordIndex}`);
    }
    this._distancesMatrix = new DanMatrix<number>({
      columns: mapLabelCoord.size,
      rows: mapLabelCoord.size,
      val: 0
    });
    // console.log(this._galaxiesMatrix.getMatrixString(4));
    // console.log(this._distancesMatrix.getMatrixString(4));
    for (let rowIndex = 0; rowIndex < this._distancesMatrix.rowsNum() - 1; rowIndex++) {
      for (let colIndex = rowIndex + 1; colIndex < this._distancesMatrix.colsNum(); colIndex++) {
        const g1Coord = mapLabelCoord.get(rowIndex);
        const g2Coord = mapLabelCoord.get(colIndex);
        if (g1Coord === undefined || g2Coord === undefined) {
          continue;
        }
        const distance = Galaxies.computeDistanceBetweenTwoGalaxies(g1Coord, g2Coord);
        this._distancesMatrix.set(rowIndex, colIndex, distance);
      }
    }
    // console.log(this._distancesMatrix.getMatrixString(4));
  }

  private static computeDistanceBetweenTwoGalaxies(g1Coord: string, g2Coord: string): number {
    const coords1Splitted = g1Coord.split('-');
    const coords2Splitted = g2Coord.split('-');
    if (coords1Splitted.length < 2 || coords2Splitted.length < 2) {
      throw new Error('Wrong input');
    }
    const xAbsValue = Math.abs(Number(coords2Splitted[0]) - Number(coords1Splitted[0]));
    const yAbsValue = Math.abs(Number(coords2Splitted[1]) - Number(coords1Splitted[1]));
    return xAbsValue + yAbsValue;
  }

  public computeGalaxiesDistancesPart1(): GalaxiesDistancesResponseType {
    this.computeGalaxiesDistances();
    const res: GalaxiesDistancesResponseType = {
      distancesMatrix: this._distancesMatrix.clone(),
      sumOfDistances: 0
    };
    for (let rowIndex = 0; rowIndex < this._distancesMatrix.rowsNum() - 1; rowIndex++) {
      for (let colIndex = rowIndex + 1; colIndex < this._distancesMatrix.colsNum(); colIndex++) {
        res.sumOfDistances += this._distancesMatrix.get(rowIndex, colIndex) ?? 0;
      }
    }
    return res;
  }
}
