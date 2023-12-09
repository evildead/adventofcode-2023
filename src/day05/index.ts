/* eslint-disable security/detect-object-injection */
import { getAsciiArtLogger, getConsoleLogger, getFileLogger } from '../logger';
import { getTextFileAsListOfLines } from '../utilities';

/*
--- Day 5: If You Give A Seed A Fertilizer ---
You take the boat and find the gardener right where you were told he would be:
managing a giant "garden" that looks more to you like a farm.

"A water source? Island Island is the water source!" You point out that Snow
Island isn't receiving any water.

"Oh, we had to stop the water because we ran out of sand to filter it with!
Can't make snow with dirty water. Don't worry, I'm sure we'll get more sand
soon; we only turned off the water a few days... weeks... oh no." His face
sinks into a look of horrified realization.

"I've been so busy making sure everyone here has food that I completely forgot
to check why we stopped getting more sand! There's a ferry leaving soon that
is headed over in that direction - it's much faster than your boat.
Could you please go check it out?"

You barely have time to agree to this request when he brings up another.
"While you wait for the ferry, maybe you can help us with our food production problem.
The latest Island Island Almanac just arrived and we're having trouble making sense of it."

The almanac (your puzzle input) lists all of the seeds that need to be planted.
It also lists what type of soil to use with each kind of seed, what type of fertilizer
to use with each kind of soil, what type of water to use with each kind of fertilizer,
and so on. Every type of seed, soil, fertilizer and so on is identified with a number,
but numbers are reused by each category - that is, soil 123 and fertilizer 123 aren't
necessarily related to each other.

For example:

seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4
The almanac starts by listing which seeds need to be planted: seeds 79, 14, 55, and 13.

The rest of the almanac contains a list of maps which describe how to convert numbers
from a source category into numbers in a destination category. That is, the section that
starts with seed-to-soil map: describes how to convert a seed number (the source) to a
soil number (the destination). This lets the gardener and his team know which soil to use
with which seeds, which water to use with which fertilizer, and so on.

Rather than list every source number and its corresponding destination number one by one,
the maps describe entire ranges of numbers that can be converted.
Each line within a map contains three numbers: the destination range start,
the source range start, and the range length.

Consider again the example seed-to-soil map:

50 98 2
52 50 48
The first line has a destination range start of 50, a source range start of 98,
and a range length of 2. This line means that the source range starts at 98 and
contains two values: 98 and 99. The destination range is the same length, but it
starts at 50, so its two values are 50 and 51. With this information, you know
that seed number 98 corresponds to soil number 50 and that seed number 99 corresponds
to soil number 51.

The second line means that the source range starts at 50 and contains 48 values:
50, 51, ..., 96, 97. This corresponds to a destination range starting at 52 and
also containing 48 values: 52, 53, ..., 98, 99. So, seed number 53 corresponds to
soil number 55.

Any source numbers that aren't mapped correspond to the same destination number.
So, seed number 10 corresponds to soil number 10.

So, the entire list of seed numbers and their corresponding soil numbers looks like this:

seed  soil
0     0
1     1
...   ...
48    48
49    49
50    52
51    53
...   ...
96    98
97    99
98    50
99    51
With this map, you can look up the soil number required for each initial seed number:

Seed number 79 corresponds to soil number 81.
Seed number 14 corresponds to soil number 14.
Seed number 55 corresponds to soil number 57.
Seed number 13 corresponds to soil number 13.
The gardener and his team want to get started as soon as possible, so they'd like to
know the closest location that needs a seed. Using these maps, find the lowest location
number that corresponds to any of the initial seeds. To do this, you'll need to convert
each seed number through other categories until you can find its corresponding location number.
In this example, the corresponding types are:

Seed 79, soil 81, fertilizer 81, water 81, light 74, temperature 78, humidity 78, location 82.
Seed 14, soil 14, fertilizer 53, water 49, light 42, temperature 42, humidity 43, location 43.
Seed 55, soil 57, fertilizer 57, water 53, light 46, temperature 82, humidity 82, location 86.
Seed 13, soil 13, fertilizer 52, water 41, light 34, temperature 34, humidity 35, location 35.
So, the lowest location number in this example is 35.

What is the lowest location number that corresponds to any of the initial seed numbers?
*/

type SeedsAndCoMapsType = {
  destinationRange: number;
  sourceRange: number;
  rangeLength: number;
};

interface SeedFertilizerInput {
  seeds: Array<number>;
  seedToSoil: Array<SeedsAndCoMapsType>;
  soilToFertilizer: Array<SeedsAndCoMapsType>;
  fertilizerToWater: Array<SeedsAndCoMapsType>;
  waterToLight: Array<SeedsAndCoMapsType>;
  lightToTemperature: Array<SeedsAndCoMapsType>;
  temperatureToHumidity: Array<SeedsAndCoMapsType>;
  humidityToLocation: Array<SeedsAndCoMapsType>;
}

type SeedFertilizerPart1ReturnType = {
  locations: Array<number>;
  minLocation: number | undefined;
};

enum SeedFertilizerFileReadModality {
  NOTHING_READ = 'NOTHING_READ',
  SEEDS_READ = 'SEEDS_READ',
  SEEDTOSOIL_READ = 'SEEDTOSOIL_READ',
  SOILTOFERTILIZER_READ = 'SOILTOFERTILIZER_READ',
  FERTILIZERTOWATER_READ = 'FERTILIZERTOWATER_READ',
  WATERTOLIGHT_READ = 'WATERTOLIGHT_READ',
  LIGHTTOTEMPERATURE_READ = 'LIGHTTOTEMPERATURE_READ',
  TEMPERATURETOHUMIDITY_READ = 'TEMPERATURETOHUMIDITY_READ',
  HUMIDITYTOLOCATION_READ = 'HUMIDITYTOLOCATION_READ'
}

class RangeMapper {
  private _input: Array<SeedsAndCoMapsType>;

  constructor(input: Array<SeedsAndCoMapsType>) {
    this.setupInput(input);
  }

  private setupInput(input: Array<SeedsAndCoMapsType>) {
    this._input = input;
  }

  public get(input: number): number {
    for (const destinationAndSourceRanges of this._input) {
      if (
        input >= destinationAndSourceRanges.sourceRange &&
        input < destinationAndSourceRanges.sourceRange + destinationAndSourceRanges.rangeLength
      ) {
        const diff = destinationAndSourceRanges.destinationRange - destinationAndSourceRanges.sourceRange;
        return input + diff;
      }
    }
    return input;
  }
}

class SeedFertilizer {
  private _input: SeedFertilizerInput;

  private _consecutiveMaps: Array<RangeMapper>;

  constructor(fileLines: Array<string>) {
    this.setupInput(fileLines);
  }

  get input(): SeedFertilizerInput {
    return this._input;
  }

  private setupInput(fileLines: Array<string>) {
    const parsedInput: SeedFertilizerInput = {
      seeds: [],
      seedToSoil: [],
      soilToFertilizer: [],
      fertilizerToWater: [],
      waterToLight: [],
      lightToTemperature: [],
      temperatureToHumidity: [],
      humidityToLocation: []
    };
    let seedFertilizerFileReadModality: SeedFertilizerFileReadModality = SeedFertilizerFileReadModality.NOTHING_READ;
    for (const fileLine of fileLines) {
      const trimmedLine = fileLine.trim();
      if (trimmedLine.length < 1) {
        continue;
      }
      if (trimmedLine.startsWith('seeds:')) {
        seedFertilizerFileReadModality = SeedFertilizerFileReadModality.SEEDS_READ;
        const seedsTitleAndNumbers = trimmedLine.split(':');
        if (seedsTitleAndNumbers.length < 2) {
          throw new Error('Wrong input type for seeds section');
        }
        const seedNumbers = seedsTitleAndNumbers[1].trim().split(/\s+/);
        parsedInput.seeds = seedNumbers.map((elem) => Number(elem));
      } else if (trimmedLine.startsWith('seed-to-soil map:')) {
        seedFertilizerFileReadModality = SeedFertilizerFileReadModality.SEEDTOSOIL_READ;
      } else if (trimmedLine.startsWith('soil-to-fertilizer map:')) {
        seedFertilizerFileReadModality = SeedFertilizerFileReadModality.SOILTOFERTILIZER_READ;
      } else if (trimmedLine.startsWith('fertilizer-to-water map:')) {
        seedFertilizerFileReadModality = SeedFertilizerFileReadModality.FERTILIZERTOWATER_READ;
      } else if (trimmedLine.startsWith('water-to-light map:')) {
        seedFertilizerFileReadModality = SeedFertilizerFileReadModality.WATERTOLIGHT_READ;
      } else if (trimmedLine.startsWith('light-to-temperature map:')) {
        seedFertilizerFileReadModality = SeedFertilizerFileReadModality.LIGHTTOTEMPERATURE_READ;
      } else if (trimmedLine.startsWith('temperature-to-humidity map:')) {
        seedFertilizerFileReadModality = SeedFertilizerFileReadModality.TEMPERATURETOHUMIDITY_READ;
      } else if (trimmedLine.startsWith('humidity-to-location map:')) {
        seedFertilizerFileReadModality = SeedFertilizerFileReadModality.HUMIDITYTOLOCATION_READ;
      } else {
        // read the three numbers
        const destinationAndSourceRanges = trimmedLine.split(/\s+/);
        if (destinationAndSourceRanges.length < 3) {
          continue;
        }
        const seedsAndCoMaps: SeedsAndCoMapsType = {
          destinationRange: Number(destinationAndSourceRanges[0]),
          sourceRange: Number(destinationAndSourceRanges[1]),
          rangeLength: Number(destinationAndSourceRanges[2])
        };
        switch (seedFertilizerFileReadModality) {
          case SeedFertilizerFileReadModality.SEEDTOSOIL_READ:
            parsedInput.seedToSoil.push(seedsAndCoMaps);
            break;
          case SeedFertilizerFileReadModality.SOILTOFERTILIZER_READ:
            parsedInput.soilToFertilizer.push(seedsAndCoMaps);
            break;
          case SeedFertilizerFileReadModality.FERTILIZERTOWATER_READ:
            parsedInput.fertilizerToWater.push(seedsAndCoMaps);
            break;
          case SeedFertilizerFileReadModality.WATERTOLIGHT_READ:
            parsedInput.waterToLight.push(seedsAndCoMaps);
            break;
          case SeedFertilizerFileReadModality.LIGHTTOTEMPERATURE_READ:
            parsedInput.lightToTemperature.push(seedsAndCoMaps);
            break;
          case SeedFertilizerFileReadModality.TEMPERATURETOHUMIDITY_READ:
            parsedInput.temperatureToHumidity.push(seedsAndCoMaps);
            break;
          case SeedFertilizerFileReadModality.HUMIDITYTOLOCATION_READ:
            parsedInput.humidityToLocation.push(seedsAndCoMaps);
            break;

          default:
            break;
        }
      }
    }
    this._input = parsedInput;
    this._consecutiveMaps = [];
    this._consecutiveMaps.push(new RangeMapper(parsedInput.seedToSoil));
    this._consecutiveMaps.push(new RangeMapper(parsedInput.soilToFertilizer));
    this._consecutiveMaps.push(new RangeMapper(parsedInput.fertilizerToWater));
    this._consecutiveMaps.push(new RangeMapper(parsedInput.waterToLight));
    this._consecutiveMaps.push(new RangeMapper(parsedInput.lightToTemperature));
    this._consecutiveMaps.push(new RangeMapper(parsedInput.temperatureToHumidity));
    this._consecutiveMaps.push(new RangeMapper(parsedInput.humidityToLocation));
  }

  private resolveInputThroughConsecutiveMaps(input: number): number {
    let currInput = input;
    for (const currMap of this._consecutiveMaps) {
      const res = currMap.get(currInput);
      if (res) {
        currInput = res;
      }
    }
    return currInput;
  }

  public calculateLocations(): SeedFertilizerPart1ReturnType {
    const returnObj: SeedFertilizerPart1ReturnType = {
      locations: [],
      minLocation: undefined
    };
    for (const seedNum of this._input.seeds) {
      const location = this.resolveInputThroughConsecutiveMaps(seedNum);
      returnObj.locations.push(location);
      if (returnObj.minLocation === undefined || returnObj.minLocation > location) {
        returnObj.minLocation = location;
      }
    }
    return returnObj;
  }
}

export function seedFertilizerPart1(filePath: string): SeedFertilizerPart1ReturnType {
  const fileLines = getTextFileAsListOfLines(filePath);
  const seedFertilizer = new SeedFertilizer(fileLines);
  const result = seedFertilizer.calculateLocations();
  return result;
}

export function startDay05() {
  const asciiArtLogger = getAsciiArtLogger('debug', 'Doom');
  const consoleLogger = getConsoleLogger('debug');
  asciiArtLogger.info('Day 5');

  // PART 1
  // const resPart1 = seedFertilizerPart1('data/day05/testInput01.txt');
  const resPart1 = seedFertilizerPart1('data/day05/input01.txt');
  consoleLogger.debug(`PART 1:\n${JSON.stringify(resPart1, null, 2)}`);
  consoleLogger.info(`PART 1: ${resPart1.minLocation}`);

  // PART 2
}

/*
(() => {
  startDay05();
})();
*/
