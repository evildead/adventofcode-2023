/* eslint-disable security/detect-object-injection */
import { getAsciiArtLogger, getConsoleLogger } from '../logger';
import { getTextFileAsListOfLines, trimAny } from '../utilities';

/*
--- Day 2: Cube Conundrum ---
You're launched high into the atmosphere! The apex of your trajectory just barely reaches the surface of a large
island floating in the sky. You gently land in a fluffy pile of leaves. It's quite cold, but you don't see much snow.
An Elf runs over to greet you.

The Elf explains that you've arrived at Snow Island and apologizes for the lack of snow.
He'll be happy to explain the situation, but it's a bit of a walk, so you have some time.
They don't get many visitors up here; would you like to play a game in the meantime?

As you walk, the Elf shows you a small bag and some cubes which are either red, green, or blue.
Each time you play this game, he will hide a secret number of cubes of each color in the bag,
and your goal is to figure out information about the number of cubes.

To get information, once a bag has been loaded with cubes, the Elf will reach into the bag, grab
a handful of random cubes, show them to you, and then put them back in the bag. He'll do this a few times per game.

You play several games and record the information from each game (your puzzle input).
Each game is listed with its ID number (like the 11 in Game 11: ...) followed by a semicolon-separated list of subsets
of cubes that were revealed from the bag (like 3 red, 5 green, 4 blue).

For example, the record of a few games might look like this:

Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
In game 1, three sets of cubes are revealed from the bag (and then put back again).
The first set is 3 blue cubes and 4 red cubes; the second set is 1 red cube, 2 green cubes, and 6 blue cubes;
the third set is only 2 green cubes.

The Elf would first like to know which games would have been possible if the bag contained only
12 red cubes, 13 green cubes, and 14 blue cubes?

In the example above, games 1, 2, and 5 would have been possible if the bag had been loaded with that configuration.
However, game 3 would have been impossible because at one point the Elf showed you 20 red cubes at once; similarly,
game 4 would also have been impossible because the Elf showed you 15 blue cubes at once. If you add up the IDs of the
games that would have been possible, you get 8.

Determine which games would have been possible if the bag had been loaded with only 12 red cubes, 13 green cubes,
and 14 blue cubes. What is the sum of the IDs of those games?

--- Part Two ---
The Elf says they've stopped producing snow because they aren't getting any water! He isn't sure why the water stopped;
however, he can show you how to get to the water source to check it out for yourself. It's just up ahead!

As you continue your walk, the Elf poses a second question: in each game you played, what is the fewest number of cubes
of each color that could have been in the bag to make the game possible?

Again consider the example games from earlier:

Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
In game 1, the game could have been played with as few as 4 red, 2 green, and 6 blue cubes. If any color had even one
fewer cube, the game would have been impossible.
Game 2 could have been played with a minimum of 1 red, 3 green, and 4 blue cubes.
Game 3 must have been played with at least 20 red, 13 green, and 6 blue cubes.
Game 4 required at least 14 red, 3 green, and 15 blue cubes.
Game 5 needed no fewer than 6 red, 3 green, and 2 blue cubes in the bag.
The power of a set of cubes is equal to the numbers of red, green, and blue cubes multiplied together. The power of the
minimum set of cubes in game 1 is 48. In games 2-5 it was 12, 1560, 630, and 36, respectively.
Adding up these five powers produces the sum 2286.

For each game, find the minimum set of cubes that must have been present. What is the sum of the power of these sets?
*/

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

function checkGameIsPossiblePart1(gameLine: string, cubesInBagsType: CubesAndNumbersType): [number, boolean, string] {
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

function powerOfTheMinimumSetOfCubesPart2(gameLine: string): [number, number] {
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

export function startDay02() {
  const asciiArtLogger = getAsciiArtLogger('debug', 'Doom');
  const consoleLogger = getConsoleLogger('debug');
  asciiArtLogger.info('Day 2');

  // PART 1
  // const resPart1 = sumOfPossibleGameIds('data/day02/testInput01.txt', checkGameIsPossiblePart1);
  const resPart1 = sumOfPossibleGameIds('data/day02/input01.txt', checkGameIsPossiblePart1);
  consoleLogger.debug(`PART 1:\n${JSON.stringify(resPart1, null, 2)}`);
  consoleLogger.info(`PART 1: ${resPart1.total}`);

  // PART 2
  // const resPart2 = sumOfPowersOfMinimumSetOfCubes('data/day02/testInput01.txt', powerOfTheMinimumSetOfCubesPart2);
  const resPart2 = sumOfPowersOfMinimumSetOfCubes('data/day02/input01.txt', powerOfTheMinimumSetOfCubesPart2);
  consoleLogger.debug(`PART 2:\n${JSON.stringify(resPart2, null, 2)}`);
  consoleLogger.info(`PART 2: ${resPart2.total}`);
}

/*
(() => {
  startDay02();
})();
*/
