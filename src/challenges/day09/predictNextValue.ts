/* eslint-disable security/detect-object-injection */
export type ExtrapolatedValuesType = {
  historyExtrapolatedValues: Array<number>;
  sumOfExtrapolatedValues: number;
};

export class PredictNextValue {
  private _historyLines: Array<Array<number>>;

  constructor(historyFileLines: Array<string>) {
    this.setupInput(historyFileLines);
  }

  private setupInput(historyFileLines: Array<string>) {
    this._historyLines = [];
    for (const historyFileLine of historyFileLines) {
      const trimmedLine = historyFileLine.trim();
      if (trimmedLine.length < 1) {
        continue;
      }
      this._historyLines.push(trimmedLine.split(/\s+/).map((elem: string) => Number(elem)));
    }
  }

  private static predictNextNumberOfHistory(historyLine: Array<number>): number {
    const predictionStructure: Array<Array<number>> = [];
    predictionStructure.push(historyLine);
    let predictionStructureIndex = 0;
    let allZeroesFound = false;
    // compute the differences -> downwards
    while (!allZeroesFound) {
      const currPredictionStructureLine = predictionStructure[predictionStructureIndex];
      const nextPredictionStructureLine: Array<number> = [];
      allZeroesFound = true;
      if (currPredictionStructureLine.length < 2) {
        break;
      }
      for (let pLineIndex = 1; pLineIndex < currPredictionStructureLine.length; pLineIndex++) {
        const currElement = currPredictionStructureLine[pLineIndex];
        const prevElement = currPredictionStructureLine[pLineIndex - 1];
        const difference = currElement - prevElement;
        if (difference !== 0) {
          allZeroesFound = false;
        }
        nextPredictionStructureLine.push(difference);
      }
      if (allZeroesFound) {
        nextPredictionStructureLine.push(0);
      }
      predictionStructure.push(nextPredictionStructureLine);
      ++predictionStructureIndex;
    }
    // sum the last elements -> upwards
    while (predictionStructureIndex > 0) {
      const currLine = predictionStructure[predictionStructureIndex];
      const prevLine = predictionStructure[predictionStructureIndex - 1];
      const lastElementsSum = currLine[currLine.length - 1] + prevLine[prevLine.length - 1];
      prevLine.push(lastElementsSum);
      --predictionStructureIndex;
    }
    // return the last element of the first line
    const firstLine = predictionStructure[0];
    return firstLine[firstLine.length - 1];
  }

  private static predictPreviousNumberOfHistory(historyLine: Array<number>) {
    const predictionStructure: Array<Array<number>> = [];
    predictionStructure.push(historyLine);
    let predictionStructureIndex = 0;
    let allZeroesFound = false;
    // compute the differences -> downwards
    while (!allZeroesFound) {
      const currPredictionStructureLine = predictionStructure[predictionStructureIndex];
      const nextPredictionStructureLine: Array<number> = [];
      allZeroesFound = true;
      if (currPredictionStructureLine.length < 2) {
        break;
      }
      for (let pLineIndex = 1; pLineIndex < currPredictionStructureLine.length; pLineIndex++) {
        const currElement = currPredictionStructureLine[pLineIndex];
        const prevElement = currPredictionStructureLine[pLineIndex - 1];
        const difference = currElement - prevElement;
        if (difference !== 0) {
          allZeroesFound = false;
        }
        nextPredictionStructureLine.push(difference);
      }
      if (allZeroesFound) {
        nextPredictionStructureLine.push(0);
      }
      predictionStructure.push(nextPredictionStructureLine);
      ++predictionStructureIndex;
    }
    // subtract the first elements -> upwards
    while (predictionStructureIndex > 0) {
      const currLine = predictionStructure[predictionStructureIndex];
      const prevLine = predictionStructure[predictionStructureIndex - 1];
      const firstElementsSubtraction = prevLine[0] - currLine[0];
      prevLine.unshift(firstElementsSubtraction);
      --predictionStructureIndex;
    }
    // return the first element of the first line
    const firstLine = predictionStructure[0];
    return firstLine[0];
  }

  public computeSumOfPredictionsPart1(): ExtrapolatedValuesType {
    const extrapolatedValues: ExtrapolatedValuesType = {
      historyExtrapolatedValues: [],
      sumOfExtrapolatedValues: 0
    };
    for (const historyLine of this._historyLines) {
      const predictedValue = PredictNextValue.predictNextNumberOfHistory(historyLine);
      extrapolatedValues.historyExtrapolatedValues.push(predictedValue);
      extrapolatedValues.sumOfExtrapolatedValues += predictedValue;
    }
    return extrapolatedValues;
  }

  computeSumOfPredictionsPart2() {
    const extrapolatedValues: ExtrapolatedValuesType = {
      historyExtrapolatedValues: [],
      sumOfExtrapolatedValues: 0
    };
    for (const historyLine of this._historyLines) {
      const predictedValue = PredictNextValue.predictPreviousNumberOfHistory(historyLine);
      extrapolatedValues.historyExtrapolatedValues.push(predictedValue);
      extrapolatedValues.sumOfExtrapolatedValues += predictedValue;
    }
    return extrapolatedValues;
  }
}
