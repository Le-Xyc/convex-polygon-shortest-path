import { Line } from './line';
import { Point } from './point';

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

  private isConvex(points: Point[]) {
    for (let i = 0; i < points.length; i++) {
      const ix1 = i;
      const ix2 = (i + 1) % points.length;
      const ix3 = (i + 2) % points.length;
      const line = new Line(points[ix1], points[ix2]);

      const initialSign = points[ix3].calculatePointLineRelation(line);

      for (
        let j = (ix3 + 1) % points.length;
        j != ix1;
        j = (j + 1) % points.length
      ) {
        if (j == ix2) continue;

        const currentSign = points[j].calculatePointLineRelation(line);

        if (
          (initialSign > 0 && currentSign < 0) ||
          (initialSign < 0 && currentSign > 0)
        ) {
          return false;
        }
      }
    }

    return true;
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

    const directPathCheckClockwise = this.isDirectPathPossible(
      p1,
      p2,
      initialClosestIndex,
      isPositiveSign,
      true,
    );
    if (directPathCheckClockwise.isPossible) {
      return [p1, p2];
    }

    const directPathCheckCounterClockwise = this.isDirectPathPossible(
      p1,
      p2,
      initialClosestIndex,
      isPositiveSign,
      false,
    );
    if (directPathCheckCounterClockwise.isPossible) {
      return [p1, p2];
    }

    const closestClockwiseIndex =
      directPathCheckClockwise.closestVertexIndex as number;
    const closestCounterClockwiseIndex =
      directPathCheckCounterClockwise.closestVertexIndex as number;

    const clockwisePathCheck = this.findPath(
      p1,
      p2,
      closestClockwiseIndex,
      isPositiveSign,
      true,
    );
    const counterClockwisePathCheck = this.findPath(
      p1,
      p2,
      closestCounterClockwiseIndex,
      isPositiveSign,
      false,
    );

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

  findPath(
    p1: Point,
    p2: Point,
    closestIndex: number,
    isPositiveSign: boolean,
    clockwise: boolean,
  ) {
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

  isDirectPathPossible(
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

  isPointInternal(point: Point): { isInternal: boolean; closestIndex: number } {
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

  getVertexIndex(
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
}
