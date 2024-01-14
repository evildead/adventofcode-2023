/* eslint-disable security/detect-object-injection */
export type HashAlgorithmResultPerStep = {
  inputStr: string;
  hashAlgorithmResult: number;
};

export type HashAlgorithmResults = {
  resultsPerStep: Array<HashAlgorithmResultPerStep>;
  sumOfResults: number;
};

export type Lens = {
  label: string;
  focalLength: number;
};

export enum StepOperationValue {
  equalSign = '=',
  dash = '-'
}

interface StepOperationEqualSign {
  num: number;
  operation: StepOperationValue.equalSign;
}

interface StepOperationDash {
  num: undefined;
  operation: StepOperationValue.dash;
}

export type StepOperation = { label: string } & (StepOperationEqualSign | StepOperationDash);

export type FocusingPowerBox = {
  boxHashValue: number;
  lensListFocusingPower: Array<number>;
};

export type FocusingPowerResult = {
  boxesFocusingPower: Array<FocusingPowerBox>;
  totalFocusingPower: number;
};

export class LensLibrary {
  private _steps: Array<string>;

  private _boxes: Map<number, Array<Lens>>;

  private _stepOperations: Array<StepOperation>;

  constructor(initializationSequence: string) {
    this._setupInput(initializationSequence);
  }

  private _setupInput(initializationSequence: string) {
    this._steps = initializationSequence.split(',');
    this._boxes = new Map<number, Array<Lens>>();
    for (let i = 0; i < 256; i++) {
      this._boxes.set(i, []);
    }
    this._stepOperations = [];
    for (const step of this._steps) {
      const currStepOperation = LensLibrary._stepOperationFromStep(step);
      this._stepOperations.push(currStepOperation);
    }
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

  private static _stepOperationFromStep(step: string): StepOperation {
    const stepLabelAndNum = step.split(/[=]|[-]/);
    if (stepLabelAndNum.length < 2) {
      throw new Error('Invalid step format');
    }
    if (stepLabelAndNum[1].length > 0) {
      return {
        label: stepLabelAndNum[0],
        operation: StepOperationValue.equalSign,
        num: Number(stepLabelAndNum[1])
      };
    }
    return {
      label: stepLabelAndNum[0],
      operation: StepOperationValue.dash,
      num: undefined
    };
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

  private _fillBoxesWithLenses(): void {
    const stepHashValueMap: Map<string, number> = new Map<string, number>();
    for (const stepOperation of this._stepOperations) {
      if (!stepHashValueMap.has(stepOperation.label)) {
        stepHashValueMap.set(stepOperation.label, LensLibrary._holidayASCIIStringHelperAlgorithm(stepOperation.label));
      }
      // stepOperation.label is surely in the Map
      const hashValue = stepHashValueMap.get(stepOperation.label) as number;
      // hashValue is always between 0 and 255
      const boxLens = this._boxes.get(hashValue) as Array<Lens>;
      const boxElemIndex = boxLens?.findIndex((lens) => lens.label === stepOperation.label);
      // element not found
      if (boxElemIndex === -1 || boxElemIndex === undefined) {
        if (stepOperation.operation === StepOperationValue.equalSign) {
          boxLens.push({
            label: stepOperation.label,
            focalLength: stepOperation.num
          });
        }
      }
      // element found
      else {
        if (stepOperation.operation === StepOperationValue.equalSign) {
          boxLens[boxElemIndex].focalLength = stepOperation.num;
        } else {
          boxLens.splice(boxElemIndex, 1);
        }
      }
    }
  }

  public focusingPowerPart2(): FocusingPowerResult {
    const res: FocusingPowerResult = {
      boxesFocusingPower: [],
      totalFocusingPower: 0
    };
    this._fillBoxesWithLenses();
    for (const [boxHashValue, lensList] of this._boxes) {
      const focusingPowerBox: FocusingPowerBox = {
        boxHashValue,
        lensListFocusingPower: []
      };
      for (let i = 0; i < lensList.length; i++) {
        const lens = lensList[i];
        const lensFocusingPower = (boxHashValue + 1) * (i + 1) * lens.focalLength;
        focusingPowerBox.lensListFocusingPower.push(lensFocusingPower);
        res.totalFocusingPower += lensFocusingPower;
      }
      res.boxesFocusingPower.push(focusingPowerBox);
    }
    return res;
  }
}
