/* eslint-disable no-use-before-define */
/* eslint-disable security/detect-object-injection */
import { EventEmitter } from 'events';
import { DanMatrix } from 'danmatrix';
import { v4 as uuidv4 } from 'uuid';

export enum Directions {
  rightward = 'rightward',
  leftward = 'leftward',
  upward = 'upward',
  downward = 'downward'
}

export enum TileType {
  empty_space = '.',
  sw_ne_mirror = '/',
  nw_se_mirror = '\\',
  vertical_splitter = '|',
  horizontal_splitter = '-'
}

export type ContraptionElement = {
  value: string;
  beamDirections: Map<Directions, number>;
};

function stringCoordsToCoords(strCoords: string): [number, number] {
  const coords = strCoords.split('-').map((elem: string) => Number(elem.trim()));
  if (coords.length < 2) {
    throw new Error('strCoords is not correctly formed. It must be "x-y"');
  }
  return [coords[0], coords[1]];
}

function coordsToStringCoords(x: number, y: number): string {
  return `${x}-${y}`;
}

// The events
const createNewBeam = 'createNewBeam';
const beamStepCompleted = 'beamStepCompleted';
const killBeam = 'killBeam';
const finished = 'finished';

class Beam {
  private _id: string;

  private _currentPosition: string | null;

  private _startingPosition: string | null;

  private _currentDirection: Directions;

  private _eventEmitter: EventEmitter;

  private _isOver: boolean;

  constructor({
    id,
    startingPosition,
    currentDirection,
    eventEmitter
  }: {
    id: string;
    startingPosition: string | null;
    currentDirection: Directions;
    eventEmitter: EventEmitter;
  }) {
    this._id = id;
    this._startingPosition = startingPosition;
    this._currentDirection = currentDirection;
    this._eventEmitter = eventEmitter;
    this._currentPosition = null;
    this._isOver = false;
  }

  public get id(): string {
    return this._id;
  }

  public set id(_id: string) {
    this._id = _id;
  }

  public get currentDirection(): Directions {
    return this._currentDirection;
  }

  public set currentDirection(_currentDirection: Directions) {
    const enumDirectionskeys = Object.keys(Directions);
    if (!enumDirectionskeys.includes(_currentDirection)) {
      throw new Error('_currentDirection must have a value contained in the enum Directions');
    }
    this._currentDirection = _currentDirection;
  }

  public get currentPosition(): string | null {
    return this._currentPosition;
  }

  public set currentPosition(_currentPosition: string | null) {
    if (_currentPosition === null) {
      this._currentPosition = null;
      return;
    }
    const coords = _currentPosition.split('-').map((elem: string) => Number(elem.trim()));
    if (coords.length < 2) {
      throw new Error('_currentPosition is not correctly formed. It must be "x-y"');
    }
    this._currentPosition = _currentPosition;
  }

  public get startingPosition(): string | null {
    return this._startingPosition;
  }

  public set startingPosition(_startingPosition: string | null) {
    if (_startingPosition === null) {
      this._startingPosition = null;
      return;
    }
    const coords = _startingPosition.split('-').map((elem: string) => Number(elem.trim()));
    if (coords.length < 2) {
      throw new Error('_startingPosition is not correctly formed. It must be "x-y"');
    }
    this._startingPosition = _startingPosition;
  }

  public kill() {
    this._isOver = true;
  }

  private _emitStepCompleted() {
    this._eventEmitter.emit(beamStepCompleted, this);
  }

  private _emitKillBeam() {
    this._eventEmitter.emit(killBeam, this);
  }

  public start() {
    if (this._startingPosition === null) {
      throw new Error('Starting position is null');
    }
    this._currentPosition = this._startingPosition;
    this._emitStepCompleted();
  }

  public nextStep(): boolean {
    if (this._isOver || this._currentPosition === null) {
      this._emitKillBeam();
      return false;
    }
    const coords = stringCoordsToCoords(this._currentPosition);
    switch (this._currentDirection) {
      case Directions.rightward:
        this._currentPosition = coordsToStringCoords(coords[0], coords[1] + 1);
        break;
      case Directions.leftward:
        if (coords[1] < 1) {
          this._emitKillBeam();
          return false;
        }
        this._currentPosition = coordsToStringCoords(coords[0], coords[1] - 1);
        break;
      case Directions.upward:
        if (coords[0] < 1) {
          this._emitKillBeam();
          return false;
        }
        this._currentPosition = coordsToStringCoords(coords[0] - 1, coords[1]);
        break;
      default:
        this._currentPosition = coordsToStringCoords(coords[0] + 1, coords[1]);
        break;
    }
    this._emitStepCompleted();
    return true;
  }
}

export class TheContraption extends EventEmitter {
  private _contraption: DanMatrix<ContraptionElement>;

  private _beams: Map<string, Beam>;

  constructor(fileLines: Array<string>) {
    super();
    this._setupInput(fileLines);
    this.on(createNewBeam, this._createNewBeamHandler);
    this.on(beamStepCompleted, this._beamStepCompletedHandler);
    this.on(killBeam, this._killBeamHandler);
  }

  public get contraption() {
    return this._contraption;
  }

  private _setupInput(fileLines: Array<string>) {
    this._contraption = new DanMatrix<ContraptionElement>();
    this._beams = new Map<string, Beam>();
    for (let lineIndex = 0; lineIndex < fileLines.length; lineIndex++) {
      const trimmedLine = fileLines[lineIndex].trim();
      if (trimmedLine.length > 0) {
        this._contraption.addRow(
          trimmedLine.split('').map((value: string) => {
            return {
              value,
              beamDirections: new Map<Directions, number>()
            };
          })
        );
      }
    }
  }

  private _countEnergizedTiles(): number {
    let numberOfEnergizedTiles = 0;
    for (const contraptionElements of this._contraption.getRowsIterator()) {
      for (const contraptionElement of contraptionElements) {
        if (contraptionElement.beamDirections.size > 0) {
          ++numberOfEnergizedTiles;
        }
      }
    }
    return numberOfEnergizedTiles;
  }

  private _killBeamHandler(beam: Beam) {
    setImmediate(() => {
      this._beams.delete(beam.id);
      beam.kill();
      if (this._beams.size < 1) {
        const energizedTiles = this._countEnergizedTiles();
        this.emit(finished, energizedTiles);
      }
    });
  }

  private _createNewBeamHandler(startingPosition: string, direction: Directions) {
    const beamId = uuidv4();
    const beam = new Beam({
      id: beamId,
      startingPosition,
      currentDirection: direction,
      eventEmitter: this
    });
    this._beams.set(beamId, beam);
    setImmediate(() => {
      beam.start();
    });
  }

  private _beamStepCompletedHandler(beam: Beam) {
    if (beam.currentPosition === null) {
      this.emit(killBeam, beam);
      return;
    }
    const contraptionElement = this._contraption.getCoord(beam.currentPosition);
    if (!contraptionElement) {
      this.emit(killBeam, beam);
      return;
    }
    // another beam had already passed through this tile with the same direction
    if (contraptionElement.beamDirections.has(beam.currentDirection)) {
      const numOfTimesOfCurrentDirection = contraptionElement.beamDirections.get(beam.currentDirection) as number;
      contraptionElement.beamDirections.set(beam.currentDirection, numOfTimesOfCurrentDirection + 1);
      this.emit(killBeam, beam);
      return;
    } else {
      contraptionElement.beamDirections.set(beam.currentDirection, 1);
    }
    switch (contraptionElement.value) {
      case TileType.sw_ne_mirror: // "/"
        if (beam.currentDirection === Directions.rightward) {
          beam.currentDirection = Directions.upward;
        } else if (beam.currentDirection === Directions.leftward) {
          beam.currentDirection = Directions.downward;
        } else if (beam.currentDirection === Directions.upward) {
          beam.currentDirection = Directions.rightward;
        } else {
          beam.currentDirection = Directions.leftward;
        }
        setImmediate(() => {
          beam.nextStep();
        });
        break;

      case TileType.nw_se_mirror: // "\"
        if (beam.currentDirection === Directions.rightward) {
          beam.currentDirection = Directions.downward;
        } else if (beam.currentDirection === Directions.leftward) {
          beam.currentDirection = Directions.upward;
        } else if (beam.currentDirection === Directions.upward) {
          beam.currentDirection = Directions.leftward;
        } else {
          beam.currentDirection = Directions.rightward;
        }
        setImmediate(() => {
          beam.nextStep();
        });
        break;

      case TileType.horizontal_splitter: // "-"
        if (beam.currentDirection === Directions.rightward || beam.currentDirection === Directions.leftward) {
          setImmediate(() => {
            beam.nextStep();
          });
        } else {
          const beamCoords = stringCoordsToCoords(beam.currentPosition);
          // create a new beam towards right
          this.emit(createNewBeam, coordsToStringCoords(beamCoords[0], beamCoords[1] + 1), Directions.rightward);
          // create a new beam towards left
          if (beamCoords[1] > 0) {
            this.emit(createNewBeam, coordsToStringCoords(beamCoords[0], beamCoords[1] - 1), Directions.leftward);
          }
          // kill the current beam
          this.emit(killBeam, beam);
        }
        break;

      case TileType.vertical_splitter: // "|"
        if (beam.currentDirection === Directions.upward || beam.currentDirection === Directions.downward) {
          setImmediate(() => {
            beam.nextStep();
          });
        } else {
          const beamCoords = stringCoordsToCoords(beam.currentPosition);
          // create a new beam upward
          if (beamCoords[0] > 0) {
            this.emit(createNewBeam, coordsToStringCoords(beamCoords[0] - 1, beamCoords[1]), Directions.upward);
          }
          // create a new beam downward
          this.emit(createNewBeam, coordsToStringCoords(beamCoords[0] + 1, beamCoords[1]), Directions.downward);
          // kill the current beam
          this.emit(killBeam, beam);
        }
        break;

      // empty space
      default:
        setImmediate(() => {
          beam.nextStep();
        });
        break;
    }
  }

  private _start() {
    this.emit(createNewBeam, '0-0', Directions.rightward);
  }

  public async computeEnergizedTiles(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.on('finished', (numberOfEnergizedTiles) => resolve(numberOfEnergizedTiles));
      this._start();
    });
  }
}
