import { trimAny } from '../utilities';

/* eslint-disable security/detect-object-injection */
export type LeftRightElements = {
  left: string;
  right: string;
};

export class LeftRightSteps {
  private _lrDirections: string;

  private _mapOfLeftRightElements: Map<string, LeftRightElements>;

  constructor(leftRightStepsFileLines: Array<string>) {
    this.setupInput(leftRightStepsFileLines);
  }

  private setupInput(leftRightStepsFileLines: Array<string>) {
    if (leftRightStepsFileLines.length < 3) {
      throw new Error('Wrong file format');
    }
    this._mapOfLeftRightElements = new Map<string, LeftRightElements>();
    // read the LR directions string
    this._lrDirections = leftRightStepsFileLines[0].trim();

    // read the network
    for (let lineIndex = 1; lineIndex < leftRightStepsFileLines.length; lineIndex++) {
      const networkLine = leftRightStepsFileLines[lineIndex].trim();
      if (networkLine.length < 5) {
        continue;
      }
      // read element and its related left and right elements
      const elementAndItsLRElements = networkLine.split('=');
      if (elementAndItsLRElements.length < 2) {
        continue;
      }
      const element = elementAndItsLRElements[0].trim();
      const lrElements = trimAny(elementAndItsLRElements[1], ' ()\r\t');
      const leftAndRightSplitted = lrElements.split(',');
      if (leftAndRightSplitted.length < 2) {
        continue;
      }
      const leftElement = leftAndRightSplitted[0].trim();
      const rightElement = leftAndRightSplitted[1].trim();
      this._mapOfLeftRightElements.set(element, {
        left: leftElement,
        right: rightElement
      });
    }
  }

  public computeNumberOfSteps(): number {
    const elementToBeFound = 'ZZZ';
    let elementFound = false;
    let lrDirectionsIndex = 0;
    let numberOfSteps = 0;
    let currElement = 'AAA';
    let currDirection: string | undefined;
    while (!elementFound) {
      currDirection = this._lrDirections.at(lrDirectionsIndex);
      const lrElements = this._mapOfLeftRightElements.get(currElement);
      if (lrElements === undefined || currDirection === undefined) {
        throw new Error('Impossible to follow the direction');
      }
      currElement = currDirection === 'L' ? lrElements.left : lrElements.right;
      ++numberOfSteps;
      if (currElement === elementToBeFound) {
        elementFound = true;
      }
      if (lrDirectionsIndex < this._lrDirections.length - 1) {
        ++lrDirectionsIndex;
      } else {
        lrDirectionsIndex = 0;
      }
    }
    return numberOfSteps;
  }
}
