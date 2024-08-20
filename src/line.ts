import { Point } from './point';

/**
 * Represents a line in a two-dimensional space defined by two points.
 */
export class Line {
  readonly a: number;
  readonly b: number;
  readonly c: number;

  constructor(p1: Point, p2: Point) {
    if (p1.isEqual(p2)) {
      throw new Error('Line must be defined by a pair of distinct points.');
    }

    // Calculate the coefficients for the line equation ax + by + c = 0
    this.a = p1.y - p2.y;
    this.b = p2.x - p1.x;
    this.c = p1.x * p2.y - p2.x * p1.y;
  }
}
