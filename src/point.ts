import { Line } from './line';

/**
 * Represents a point in a two-dimensional space.
 */
export class Point {
  readonly x: number;
  readonly y: number;

  constructor();
  constructor(x: number, y: number);
  constructor(x?: number, y?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
  }

  toString(): string {
    return `${this.x} ${this.y}`;
  }

  /**
   * Creates point or points from a string representation depending on a string.
   * @param {string} line - The string containing point coordinates.
   * @returns {Point | Point[]} A single point or an array of points.
   */
  static fromString(line: string): Point | Point[] {
    const numbers = line.split(/\s+/).map(Number);
    const points: Point[] = [];
    for (let i = 0; i < numbers.length; i += 2) {
      points.push(new Point(numbers[i], numbers[i + 1]));
    }

    return points.length === 1 ? points[0] : points;
  }

  isEqual(p: Point): boolean {
    return this.x === p.x && this.y === p.y;
  }

  /**
   * Calculates the Euclidean distance between two points.
   * @param {Point} p1 - The first point.
   * @param {Point} p2 - The second point.
   * @returns {number} The distance between point p1 and point p2.
   */
  static calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  /**
   * Calculates the Euclidean distance from this point to another point.
   * @param {Point} p - The other point to which the distance will be calculated.
   * @returns {number} The distance between this and point p.
   */
  calculateDistance(p: Point): number {
    return Point.calculateDistance(this, p);
  }

  /**
   * Calculates the scalar value of the line equation at this point.
   * @param {Line} line - The line defined by the equation ax + by + c = 0.
   * @returns {number} The scalar value representing the point's relation to the line.
   */
  calculatePointLineRelation(line: Line): number {
    return line.a * this.x + line.b * this.y + line.c;
  }

  /**
   * Calculates the vector product of two vectors defined by four points.
   * @param {Point} p11 - The starting point of the first vector.
   * @param {Point} p12 - The ending point of the first vector.
   * @param {Point} p21 - The starting point of the second vector.
   * @param {Point} p22 - The ending point of the second vector.
   * @returns {number} The scalar value representing the vector product of the two vectors.
   */
  static calculateVectorProduct(
    p11: Point,
    p12: Point,
    p21: Point,
    p22: Point,
  ): number {
    return (
      (p12.x - p11.x) * (p22.y - p21.y) - (p12.y - p11.y) * (p22.x - p21.x)
    );
  }
}
