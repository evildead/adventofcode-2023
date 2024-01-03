/* eslint-disable security/detect-object-injection */
import { getTextFileAsListOfLines, trimAny } from '../../utilities';

export type PossibleGameItemType = {
  gameId: number;
  isPossible: boolean;
  reason: string; // reason why it's not possible
};

export type PossibleGamesResultType = {
  games: Array<PossibleGameItemType>;
  total: number;
};

export type CubesAndNumbersType = {
  red: number;
  green: number;
  blue: number;
};

export type MinimumSetOfCubesItemType = {
  gameId: number;
  powerOfMinimumSetOfCubes: number;
};

export type MinimumSetOfCubesResultType = {
  games: Array<MinimumSetOfCubesItemType>;
  total: number;
};

export function checkGameIsPossiblePart1(
  gameLine: string,
  cubesInBagsType: CubesAndNumbersType
): [number, boolean, string] {
  let gameId = -1;
  let isPossible = false;
  let reason = '';
  const gameAndSets = gameLine.split(':');
  if (!Array.isArray(gameAndSets) || gameAndSets.length < 2) {
    return [gameId, isPossible, reason];
  }
  // get gameId
  const gameAndGameId = gameAndSets[0].split(' ');
  if (!Array.isArray(gameAndGameId) || gameAndGameId.length < 2) {
    return [gameId, isPossible, reason];
  }
  gameId = Number(gameAndGameId[1]);
  // find the sets
  const sets = gameAndSets[1].split(';');
  if (!Array.isArray(sets) || sets.length < 1) {
    return [gameId, isPossible, reason];
  }
  for (const cubeSet of sets) {
    const cubes = cubeSet.split(',');
    if (!Array.isArray(cubes) || cubes.length < 1) {
      continue;
    }
    // get cube colour and number
    for (const cube of cubes) {
      const trimmedCube = trimAny(cube, '\r\n\t\v ,;.');
      const cubeColourAndNumber = trimmedCube.split(' ');
      if (!Array.isArray(cubeColourAndNumber) || cubeColourAndNumber.length < 2) {
        continue;
      }
      const cubeNumber = Number(trimAny(cubeColourAndNumber[0], '\r\n\t\v ,;.'));
      const cubeColour = trimAny(cubeColourAndNumber[1], '\r\n\t\v ,;.');
      if (cubesInBagsType[cubeColour] < cubeNumber) {
        reason = `Max num of ${cubeColour} is ${cubesInBagsType[cubeColour]}, but found ${cubeNumber}`;
        break;
      }
    }
    if (reason.length > 0) {
      break;
    }
  }
  if (reason.length < 1) {
    isPossible = true;
  }
  return [gameId, isPossible, reason];
}

export function powerOfTheMinimumSetOfCubesPart2(gameLine: string): [number, number] {
  let gameId = -1;
  const minimumColours: CubesAndNumbersType = {
    red: 1,
    green: 1,
    blue: 1
  };
  const gameAndSets = gameLine.split(':');
  if (!Array.isArray(gameAndSets) || gameAndSets.length < 2) {
    return [gameId, 1];
  }
  // get gameId
  const gameAndGameId = gameAndSets[0].split(' ');
  if (!Array.isArray(gameAndGameId) || gameAndGameId.length < 2) {
    return [gameId, 1];
  }
  gameId = Number(gameAndGameId[1]);
  // find the sets
  const sets = gameAndSets[1].split(';');
  if (!Array.isArray(sets) || sets.length < 1) {
    return [gameId, 1];
  }
  for (const cubeSet of sets) {
    const cubes = cubeSet.split(',');
    if (!Array.isArray(cubes) || cubes.length < 1) {
      continue;
    }
    // get cube colour and number
    for (const cube of cubes) {
      const trimmedCube = trimAny(cube, '\r\n\t\v ,;.');
      const cubeColourAndNumber = trimmedCube.split(' ');
      if (!Array.isArray(cubeColourAndNumber) || cubeColourAndNumber.length < 2) {
        continue;
      }
      const cubeNumber = Number(trimAny(cubeColourAndNumber[0], '\r\n\t\v ,;.'));
      const cubeColour = trimAny(cubeColourAndNumber[1], '\r\n\t\v ,;.');
      minimumColours[cubeColour] = minimumColours[cubeColour] < cubeNumber ? cubeNumber : minimumColours[cubeColour];
    }
  }
  return [gameId, minimumColours.red * minimumColours.green * minimumColours.blue];
}

export function sumOfPossibleGameIds(
  filePath: string,
  strategy: (gameLine: string, cubesInBagsType: CubesAndNumbersType) => [number, boolean, string]
): PossibleGamesResultType {
  const gameLines = getTextFileAsListOfLines(filePath);
  const result: PossibleGamesResultType = {
    games: [],
    total: 0
  };
  const cubesInBagsType: CubesAndNumbersType = {
    red: 12,
    green: 13,
    blue: 14
  };
  for (const gameLine of gameLines) {
    const trimmedGameLine = trimAny(gameLine, '\r\n\t\v ');
    const [gameId, isPossible, reason] = strategy(trimmedGameLine, cubesInBagsType);
    result.games.push({
      gameId,
      isPossible,
      reason
    });
    result.total += isPossible ? gameId : 0;
  }
  return result;
}

export function sumOfPowersOfMinimumSetOfCubes(
  filePath: string,
  strategy: (gameLine: string) => [number, number]
): MinimumSetOfCubesResultType {
  const gameLines = getTextFileAsListOfLines(filePath);
  const result: MinimumSetOfCubesResultType = {
    games: [],
    total: 0
  };
  for (const gameLine of gameLines) {
    const trimmedGameLine = trimAny(gameLine, '\r\n\t\v ');
    const [gameId, powerOfMinimumSetOfCubes] = strategy(trimmedGameLine);
    result.games.push({
      gameId,
      powerOfMinimumSetOfCubes
    });
    result.total += powerOfMinimumSetOfCubes;
  }
  return result;
}
