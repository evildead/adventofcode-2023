/* eslint-disable security/detect-object-injection */
import { DirectedGraph, CDanNode, CDanArc, DanArc } from 'dangraph';
import { DanMatrix } from '../utilities/danMatrix';

export type GiantLoopStepsToFarthestPointResponseType = {
  loopNodes: Array<string>;
  symbolsString: string;
  numberOfStepsToFarthestPoint: number;
};

type NodeAndArcsToVisit = {
  nodeId: string;
  arcs: Array<DanArc<string, undefined>> | undefined;
  lastVisited: number | undefined;
};

export class GiantLoop {
  private _input: DanMatrix<string>;
  private _startingPosition: string;
  private _pipeGraph: DirectedGraph.DanDirectedGraph<string, undefined>;

  constructor(fileLines: Array<string>) {
    this.setupInput(fileLines);
  }

  private setupInput(fileLines: Array<string>) {
    // populate the pipe Matrix
    this._input = new DanMatrix<string>();
    for (let lineIndex = 0; lineIndex < fileLines.length; lineIndex++) {
      const trimmedLine = fileLines[lineIndex].trim();
      if (trimmedLine.length > 0) {
        this._input.addRow(trimmedLine.split(''));
      }
    }

    // find the starting position
    const coordsArray = this._input.lookForValue('S');
    if (coordsArray.length < 1) {
      throw new Error('Starting position not found');
    }
    this._startingPosition = coordsArray[0];

    // Create the graph
    this.createTheGraph();
  }

  private createTheGraph() {
    this._pipeGraph = new DirectedGraph.DanDirectedGraph<string, undefined>();
    for (let i = 0; i < this._input.rowsNum(); i++) {
      for (let j = 0; j < this._input.colsNum(); j++) {
        const element = this._input.get(i, j);
        if (element === undefined) {
          throw new Error('Unexpected Matrix error');
        }
        if (element === '.') {
          // found the ground element
          continue;
        }
        this._pipeGraph.addNode(new CDanNode<string, undefined>({ id: `${i}-${j}` }));
        switch (element) {
          // | is a vertical pipe connecting north and south.
          case '|':
            // north
            this.graphCreateArcToNorth(i, j);
            // south
            this.graphCreateArcToSouth(i, j);
            break;
          // - is a horizontal pipe connecting east and west.
          case '-':
            // east
            this.graphCreateArcToEast(i, j);
            // west
            this.graphCreateArcToWest(i, j);
            break;
          // L is a 90-degree bend connecting north and east.
          case 'L':
            // north
            this.graphCreateArcToNorth(i, j);
            // east
            this.graphCreateArcToEast(i, j);
            break;
          // J is a 90-degree bend connecting north and west.
          case 'J':
            // north
            this.graphCreateArcToNorth(i, j);
            // west
            this.graphCreateArcToWest(i, j);
            break;
          // 7 is a 90-degree bend connecting south and west.
          case '7':
            // south
            this.graphCreateArcToSouth(i, j);
            // west
            this.graphCreateArcToWest(i, j);
            break;
          // F is a 90-degree bend connecting south and east.
          case 'F':
            // south
            this.graphCreateArcToSouth(i, j);
            // east
            this.graphCreateArcToEast(i, j);
            break;
          default:
            break;
        }
      }
    }
  }

  private graphCreateArcToNorth(i: number, j: number) {
    if (i - 1 >= 0 && this._input.getCoord(`${i - 1}-${j}`) !== '.') {
      this._pipeGraph.addArcToNodeId(
        `${i}-${j}`,
        new CDanArc({ weight: 1, node: new CDanNode({ id: `${i - 1}-${j}` }) }),
        DirectedGraph.ArcType.outgoing
      );
    }
  }

  private graphCreateArcToSouth(i: number, j: number) {
    if (i + 1 < this._input.rowsNum() && this._input.getCoord(`${i + 1}-${j}`) !== '.') {
      this._pipeGraph.addArcToNodeId(
        `${i}-${j}`,
        new CDanArc({ weight: 1, node: new CDanNode({ id: `${i + 1}-${j}` }) }),
        DirectedGraph.ArcType.outgoing
      );
    }
  }

  private graphCreateArcToWest(i: number, j: number) {
    if (j - 1 >= 0 && this._input.getCoord(`${i}-${j - 1}`) !== '.') {
      this._pipeGraph.addArcToNodeId(
        `${i}-${j}`,
        new CDanArc({ weight: 1, node: new CDanNode({ id: `${i}-${j - 1}` }) }),
        DirectedGraph.ArcType.outgoing
      );
    }
  }

  private graphCreateArcToEast(i: number, j: number) {
    if (j + 1 < this._input.colsNum() && this._input.getCoord(`${i}-${j + 1}`) !== '.') {
      this._pipeGraph.addArcToNodeId(
        `${i}-${j}`,
        new CDanArc({ weight: 1, node: new CDanNode({ id: `${i}-${j + 1}` }) }),
        DirectedGraph.ArcType.outgoing
      );
    }
  }

  private findGiantLoopIter(): Array<string> {
    const visitedNodes: Set<string> = new Set();
    const nodeArcs = this._pipeGraph.getNodeAndDirectedArcsFromNodeId(this._startingPosition);
    if (nodeArcs === undefined) {
      return [];
    }

    const loopNodes: Array<NodeAndArcsToVisit> = [];
    // look for the incoming arcs of the starting position
    for (const outArc of nodeArcs.incoming.values()) {
      loopNodes.push({
        nodeId: outArc.node.id,
        arcs: undefined,
        lastVisited: undefined
      });
      const res = this._findGiantLoopIter(visitedNodes, loopNodes);
      if (res) {
        break;
      } else {
        loopNodes.splice(0, loopNodes.length);
      }
    }

    return loopNodes.map((value: NodeAndArcsToVisit) => {
      return value.nodeId;
    });
  }

  private _findGiantLoopIter(visitedNodes: Set<string>, loopNodes: Array<NodeAndArcsToVisit>): boolean {
    while (loopNodes.length > 0) {
      // get next node (with related arcs) to visit
      const nextNodeAndArcs = loopNodes[loopNodes.length - 1];
      // look for node's arcs (if it's undefined it's a new node to check)
      if (nextNodeAndArcs.arcs === undefined) {
        // check if we found the starting position
        if (nextNodeAndArcs.nodeId === this._startingPosition) {
          if (loopNodes.length > 2) {
            return true;
          }
          loopNodes.pop();
          continue;
        }
        if (visitedNodes.has(nextNodeAndArcs.nodeId)) {
          loopNodes.pop();
          continue;
        }
        visitedNodes.add(nextNodeAndArcs.nodeId);
        const nodeArcs = this._pipeGraph.getNodeAndDirectedArcsFromNodeId(nextNodeAndArcs.nodeId);
        if (nodeArcs !== undefined) {
          nextNodeAndArcs.arcs = Array.from(nodeArcs.outgoing.values());
        }
        nextNodeAndArcs.lastVisited = undefined;
      }
      // increment the lastVisited value
      if (nextNodeAndArcs.lastVisited === undefined) {
        nextNodeAndArcs.lastVisited = 0;
      } else {
        nextNodeAndArcs.lastVisited++;
      }
      if (nextNodeAndArcs.arcs === undefined || nextNodeAndArcs.lastVisited >= nextNodeAndArcs.arcs.length) {
        loopNodes.pop();
        continue;
      }
      const currArc = nextNodeAndArcs.arcs[nextNodeAndArcs.lastVisited];
      loopNodes.push({
        nodeId: currArc.node.id,
        arcs: undefined,
        lastVisited: undefined
      });
    }
    return false;
  }

  // correct but ends in Stack-Overflow for giant inputs
  private findGiantLoopRec(): Array<string> {
    const visitedNodes: Set<string> = new Set();
    const nodeArcs = this._pipeGraph.getNodeAndDirectedArcsFromNodeId(this._startingPosition);
    if (nodeArcs === undefined) {
      return [];
    }

    const loopNodes: Array<string> = [];
    // look for the incoming arcs of the starting position
    for (const outArc of nodeArcs.incoming.values()) {
      loopNodes.push(outArc.node.id);
      const res = this._findGiantLoopRec(visitedNodes, outArc.node.id, loopNodes, `${this._startingPosition}`);
      if (res) {
        break;
      } else {
        loopNodes.splice(0, loopNodes.length);
      }
    }

    return loopNodes;
  }

  // correct but ends in Stack-Overflow for giant inputs
  private _findGiantLoopRec(
    visitedNodes: Set<string>,
    nextNodeId: string,
    loopNodes: Array<string>,
    parentNode: string
  ): boolean {
    if (nextNodeId === this._startingPosition) {
      return true;
    }
    if (visitedNodes.has(nextNodeId)) {
      return false;
    }
    visitedNodes.add(nextNodeId);
    if (parentNode === nextNodeId) {
      return false;
    }
    const nodeArcs = this._pipeGraph.getNodeAndDirectedArcsFromNodeId(nextNodeId);
    if (nodeArcs === undefined) {
      return false;
    }
    for (const outArc of nodeArcs.outgoing.values()) {
      if (outArc.node.id === parentNode) {
        continue;
      }
      if (visitedNodes.has(outArc.node.id)) {
        continue;
      }
      loopNodes.push(outArc.node.id);
      const found = this._findGiantLoopRec(visitedNodes, outArc.node.id, loopNodes, nextNodeId);
      if (found) {
        return true;
      } else {
        loopNodes.pop();
      }
    }
    return false;
  }

  public computeStepsToTheFarthestPointPart1(): GiantLoopStepsToFarthestPointResponseType {
    const nodesInTheLoop = this.findGiantLoopIter();
    const res: GiantLoopStepsToFarthestPointResponseType = {
      loopNodes: nodesInTheLoop,
      numberOfStepsToFarthestPoint: Math.floor(nodesInTheLoop.length / 2),
      symbolsString: ''
    };
    for (const coord of nodesInTheLoop) {
      const symbol = this._input.getCoord(coord);
      if (symbol !== undefined) {
        res.symbolsString += symbol;
      }
    }
    return res;
  }
}
