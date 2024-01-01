/* eslint-disable security/detect-object-injection */
import { trimAny } from '../utilities';

export type ArrangementsResponseType = {
  arrangementsPerRecord: Array<[string, number]>;
  sumOfArrangements: number;
};

type DamagesType = {
  // current assigned index of unknownSpringConditionIndexArray
  val: number | undefined;
  // index of unknownSpringConditionIndexArray to start from
  start: number;
  // index of unknownSpringConditionIndexArray to end to
  end: number;
};

export class DamagedSprings {
  private _records: Array<string>;

  constructor(fileLines: Array<string>) {
    this.setupInput(fileLines);
  }

  private setupInput(fileLines: Array<string>) {
    this._records = [];
    for (let lineIndex = 0; lineIndex < fileLines.length; lineIndex++) {
      const trimmedLine = fileLines[lineIndex].trim();
      if (trimmedLine.length > 0) {
        this._records.push(trimmedLine);
      }
    }
  }

  private static getContiguousGroupSizesFromNoUnknownRecord(noUnknownRecord: string): string {
    let contiguousGroupSizes = '';
    const damagesGroups = trimAny(noUnknownRecord, '.').split(/\.+/);
    for (let damagesGroupsIndex = 0; damagesGroupsIndex < damagesGroups.length; damagesGroupsIndex++) {
      const damagesGroup = damagesGroups[damagesGroupsIndex];
      if (damagesGroupsIndex > 0) {
        contiguousGroupSizes += ',';
      }
      contiguousGroupSizes += damagesGroup.length;
    }
    return contiguousGroupSizes;
  }

  private static computePossibleArrangementsOfRecordWithUnknown(record: string) {
    const springConditionsAndContiguousGroupSizes = record.split(' ');
    if (springConditionsAndContiguousGroupSizes.length < 2) {
      throw new Error('Wrong input');
    }
    const unknownSpringConditionIndexArray: Array<number> = [];
    let numOfKnownDamages = 0;
    let numOfUnknownConditions = 0;
    const springConditions = springConditionsAndContiguousGroupSizes[0];
    for (let springConditionsIndex = 0; springConditionsIndex < springConditions.length; springConditionsIndex++) {
      const springCondition = springConditions[springConditionsIndex];
      if (springCondition === '?') {
        unknownSpringConditionIndexArray.push(springConditionsIndex);
        numOfUnknownConditions++;
      } else if (springCondition === '#') {
        numOfKnownDamages++;
      }
    }
    const contiguousGroupSizes = springConditionsAndContiguousGroupSizes[1];
    const contiguousGroupSizesArray = contiguousGroupSizes.split(',').map((groupSize) => Number(groupSize));
    const sumOfContiguousGroupSizes = contiguousGroupSizesArray.reduce((a, b) => {
      return a + b;
    });

    const numOfDamagesToAssign = sumOfContiguousGroupSizes - numOfKnownDamages;
    const damages: Array<DamagesType> = [
      {
        val: undefined,
        start: 0,
        end: unknownSpringConditionIndexArray.length - numOfDamagesToAssign
      }
    ];
    const totalArrangements = DamagedSprings.computeArrangementsBruteForceIter(
      springConditions,
      contiguousGroupSizes,
      unknownSpringConditionIndexArray,
      numOfDamagesToAssign,
      damages
    );
    return totalArrangements;
  }

  private static computeArrangementsBruteForceIter(
    springConditions: string,
    contiguousGroupSizes: string,
    unknownSpringConditionIndexArray: Array<number>,
    numOfDamagesToAssign: number,
    damages: Array<DamagesType>
  ) {
    if (numOfDamagesToAssign === 0) {
      return 1;
    }
    const springConditionsWithUnknown = springConditions.split('');
    for (let i = 0; i < unknownSpringConditionIndexArray.length; i++) {
      const indexOfUnknownCondition = unknownSpringConditionIndexArray[i];
      springConditionsWithUnknown[indexOfUnknownCondition] = '.';
    }
    let totalCorrectArrangements = 0;
    while (damages.length > 0) {
      const currDamage = damages[damages.length - 1];
      if (currDamage.val === undefined) {
        currDamage.val = currDamage.start;
      } else {
        springConditionsWithUnknown[unknownSpringConditionIndexArray[currDamage.val]] = '.';
        currDamage.val++;
      }
      // value in range
      if (currDamage.val <= currDamage.end) {
        springConditionsWithUnknown[unknownSpringConditionIndexArray[currDamage.val]] = '#';
        // last damage assign
        if (numOfDamagesToAssign === damages.length) {
          const computedContiguousGroupSizes = DamagedSprings.getContiguousGroupSizesFromNoUnknownRecord(
            springConditionsWithUnknown.join('')
          );
          if (computedContiguousGroupSizes === contiguousGroupSizes) {
            totalCorrectArrangements++;
          }
        } else {
          damages.push({
            val: undefined,
            start: currDamage.val + 1,
            end: unknownSpringConditionIndexArray.length - numOfDamagesToAssign + damages.length
          });
        }
      }
      // value not in range
      else {
        damages.pop();
      }
    }
    return totalCorrectArrangements;
  }

  public computeArrangementsPart1(): ArrangementsResponseType {
    const arrangements: ArrangementsResponseType = {
      arrangementsPerRecord: [],
      sumOfArrangements: 0
    };
    for (const record of this._records) {
      const arrangementsOfRecord = DamagedSprings.computePossibleArrangementsOfRecordWithUnknown(record);
      arrangements.arrangementsPerRecord.push([record, arrangementsOfRecord]);
      arrangements.sumOfArrangements += arrangementsOfRecord;
    }
    return arrangements;
  }
}
