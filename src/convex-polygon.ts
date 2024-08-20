import { Line } from './line';
import { Point } from './point';

type PathCheck = {
  startIndex: number;
  finishIndex: number;
  distance: number;
};

export class ConvexPolygon {
  private points: Point[];

  constructor(points: Point[]) {
    if (!this.isPolygon(points)) {
      throw new Error('A polygon must have at least three points.');
    }

    if (!this.isConvex(points)) {
      throw new Error('The points do not form a convex polygon.');
    }

    this.points = points;
  }

  private isPolygon(points: Point[]) {
    return points.length > 2;
  }

  private isConvex(points: Point[]): boolean {
    let lastSign = 0;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const p3 = points[(i + 2) % points.length];

      const crossProduct = Point.calculateVectorProduct(p1, p2, p1, p3);
      const currentSign = Math.sign(crossProduct);

      if (lastSign != 0 && currentSign != lastSign) {
        return false;
      }

      lastSign = currentSign;
    }

    return true;
  }

  private findPath(
    p1: Point,
    p2: Point,
    closestIndex: number,
    isPositiveSign: boolean,
    clockwise: boolean,
  ): PathCheck {
    const points = this.points;
    const startIndex = closestIndex;
    let finishIndex = closestIndex;
    let currentIndex = closestIndex;
    let distance = Point.calculateDistance(p1, points[closestIndex]);
    let product;

    while (true) {
      const nextIndex = this.getVertexIndex(currentIndex, 1, clockwise);
      product = Point.calculateVectorProduct(
        points[currentIndex],
        p2,
        points[currentIndex],
        points[nextIndex],
      );
      if (isPositiveSign ? product >= 0 : product <= 0) {
        distance += Point.calculateDistance(points[currentIndex], p2);
        finishIndex = currentIndex;
        break;
      } else {
        if (currentIndex !== (clockwise ? points.length - 1 : 0)) {
          distance += Point.calculateDistance(
            points[currentIndex],
            points[nextIndex],
          );
        }
        currentIndex = nextIndex;
      }
    }

    return { startIndex, finishIndex, distance };
  }

  private isDirectPathPossible(
    p1: Point,
    p2: Point,
    initialClosestIndex: number,
    isPositiveSign: boolean,
    clockwise: boolean,
  ): { isPossible: boolean; closestVertexIndex?: number } {
    let product;
    const points = this.points;

    let closestIndex = initialClosestIndex;
    while (true) {
      const nextIndex = this.getVertexIndex(closestIndex, 1, clockwise);
      product = Point.calculateVectorProduct(
        p1,
        points[closestIndex],
        points[closestIndex],
        points[nextIndex],
      );

      if (
        (isPositiveSign && (clockwise ? product > 0 : product < 0)) ||
        (!isPositiveSign && (clockwise ? product < 0 : product > 0))
      ) {
        break;
      } else {
        closestIndex = nextIndex;
      }
    }

    product = Point.calculateVectorProduct(
      p1,
      points[closestIndex],
      points[closestIndex],
      p2,
    );

    if (
      (isPositiveSign && (clockwise ? product <= 0 : product >= 0)) ||
      (!isPositiveSign && (clockwise ? product >= 0 : product <= 0))
    ) {
      return { isPossible: true };
    }

    if (
      Point.calculateDistance(p1, p2) <=
      Point.calculateDistance(p1, points[closestIndex])
    ) {
      product = Point.calculateVectorProduct(
        p1,
        p2,
        p1,
        points[initialClosestIndex],
      );
      if (
        (isPositiveSign && (clockwise ? product <= 0 : product >= 0)) ||
        (!isPositiveSign && (clockwise ? product >= 0 : product <= 0))
      ) {
        return { isPossible: true };
      }
    }

    return { isPossible: false, closestVertexIndex: closestIndex };
  }

  private isPointInternal(point: Point): {
    isInternal: boolean;
    closestIndex: number;
  } {
    const distances = this.points.map((p) => p.calculateDistance(point));
    const closestIndex = distances.indexOf(Math.min(...distances));
    const closestMinusIndex =
      (closestIndex - 1 + this.points.length) % this.points.length;
    const closestPlusIndex =
      (closestIndex + 1 + this.points.length) % this.points.length;

    const closestPoint = this.points[closestIndex];
    const closestMinusPoint = this.points[closestMinusIndex];
    const closestPlusPoint = this.points[closestPlusIndex];

    const line1 = new Line(closestPoint, closestMinusPoint);
    const line2 = new Line(closestPoint, closestPlusPoint);

    const b1 =
      point.calculatePointLineRelation(line1) *
      closestPlusPoint.calculatePointLineRelation(line1);
    const b2 =
      point.calculatePointLineRelation(line2) *
      closestMinusPoint.calculatePointLineRelation(line2);

    return { isInternal: b1 > 0 && b2 > 0, closestIndex };
  }

  private getVertexIndex(
    currentIndex: number,
    offset: number,
    clockwise: boolean,
  ): number {
    if (clockwise) {
      return (currentIndex + offset) % this.points.length;
    } else {
      return (currentIndex - offset + this.points.length) % this.points.length;
    }
  }

  findShortestPath(p1: Point, p2: Point): Point[] {
    const internalCheckP1 = this.isPointInternal(p1);
    if (internalCheckP1.isInternal) {
      throw new Error('The first point is inside the polygon.');
    }

    const internalCheckP2 = this.isPointInternal(p2);
    if (internalCheckP2.isInternal) {
      throw new Error('The second point is inside the polygon.');
    }

    const points = this.points;
    const initialClosestIndex = internalCheckP1.closestIndex;
    const isPositiveSign =
      Point.calculateVectorProduct(
        points[initialClosestIndex],
        points[this.getVertexIndex(initialClosestIndex, 1, true)],
        points[this.getVertexIndex(initialClosestIndex, 1, true)],
        points[this.getVertexIndex(initialClosestIndex, 2, true)],
      ) > 0;

    const pathChecks: PathCheck[] = [];

    for (const isClockwise of [true, false]) {
      const directPathCheck = this.isDirectPathPossible(
        p1,
        p2,
        initialClosestIndex,
        isPositiveSign,
        isClockwise,
      );

      if (directPathCheck.isPossible) {
        return [p1, p2];
      }

      const closestIndex = directPathCheck.closestVertexIndex as number;

      pathChecks.push(
        this.findPath(p1, p2, closestIndex, isPositiveSign, isClockwise),
      );
    }

    const clockwisePathCheck = pathChecks[0];
    const counterClockwisePathCheck = pathChecks[1];
    const result = [p1];

    const isClockwiseWayShorter =
      clockwisePathCheck.distance < counterClockwisePathCheck.distance;

    const startIndex = (
      isClockwiseWayShorter ? clockwisePathCheck : counterClockwisePathCheck
    ).startIndex;

    const finishIndex = (
      isClockwiseWayShorter ? clockwisePathCheck : counterClockwisePathCheck
    ).finishIndex;

    for (
      let i = startIndex;
      i !== finishIndex;
      i = this.getVertexIndex(i, 1, isClockwiseWayShorter)
    ) {
      result.push(points[i]);
    }

    return [...result, points[finishIndex], p2];
  }
}
