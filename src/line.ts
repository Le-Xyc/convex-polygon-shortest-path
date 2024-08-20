import { Point } from './point';

export class Line {
  readonly a: number;
  readonly b: number;
  readonly c: number;

  constructor(p1: Point, p2: Point) {
    if (p1.isEqual(p2)) {
      throw new Error('Line must be defined by a pair of distinct points.');
    }

    this.a = p1.y - p2.y;
    this.b = p2.x - p1.x;
    this.c = p1.x * p2.y - p2.x * p1.y;
  }
}
