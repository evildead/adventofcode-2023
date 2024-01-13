export type HashAlgorithmResultPerStep = {
  inputStr: string;
  hashAlgorithmResult: number;
};

export type HashAlgorithmResults = {
  resultsPerStep: Array<HashAlgorithmResultPerStep>;
  sumOfResults: number;
};

export class LensLibrary {
  private _steps: Array<string>;

  constructor(initializationSequence: string) {
    this._setupInput(initializationSequence);
  }

  private _setupInput(initializationSequence: string) {
    this._steps = initializationSequence.split(',');
  }

  private static _holidayASCIIStringHelperAlgorithm(inputStr: string): number {
    let hashValue = 0;
    for (const inputStrChar of inputStr) {
      const asciiVal = inputStrChar.charCodeAt(0);
      hashValue += asciiVal;
      hashValue *= 17;
      hashValue %= 256;
    }
    return hashValue;
  }

  public sumHashAlgorithmResultsPart1(): HashAlgorithmResults {
    const res: HashAlgorithmResults = {
      resultsPerStep: [],
      sumOfResults: 0
    };
    for (const step of this._steps) {
      const hashAlgorithmResult = LensLibrary._holidayASCIIStringHelperAlgorithm(step);
      res.resultsPerStep.push({
        inputStr: step,
        hashAlgorithmResult
      });
      res.sumOfResults += hashAlgorithmResult;
    }
    return res;
  }
}
