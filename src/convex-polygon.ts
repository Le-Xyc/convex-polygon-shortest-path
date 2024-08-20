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

    let product;
    const points = this.points;
    const ixPlus = (ix: number, plusIx: number) =>
      (ix + plusIx) % points.length;
    const ixMinus = (ix: number, minusIx: number) =>
      (ix - minusIx + points.length) % points.length;

    const i = internalCheckP1.closestIndex;
    const positiveSign =
      Point.calculateVectorProduct(
        points[i],
        points[ixPlus(i, 1)],
        points[ixPlus(i, 1)],
        points[ixPlus(i, 2)],
      ) > 0;

    let j = i;
    while (true) {
      product = Point.calculateVectorProduct(
        p1,
        points[j],
        points[j],
        points[ixPlus(j, 1)],
      );
      if (positiveSign ? product > 0 : product < 0) {
        break;
      } else {
        j = ixPlus(j, 1);
      }
    }

    product = Point.calculateVectorProduct(p1, points[j], points[j], p2);
    if (positiveSign ? product <= 0 : product >= 0) {
      return [p1, p2];
    }

    if (
      Point.calculateDistance(p1, p2) <= Point.calculateDistance(p1, points[j])
    ) {
      product = Point.calculateVectorProduct(p1, p2, p1, points[i]);
      if (positiveSign ? product <= 0 : product >= 0) {
        return [p1, p2];
      }
    }

    let firstWayStartIx = j;
    let firstWayLastIx;
    let firstWayLength = Point.calculateDistance(p1, points[j]);

    while (true) {
      product = Point.calculateVectorProduct(
        points[j],
        p2,
        points[j],
        points[ixPlus(j, 1)],
      );
      if (positiveSign ? product >= 0 : product <= 0) {
        firstWayLength += Point.calculateDistance(points[j], p2);
        firstWayLastIx = j;
        break;
      } else {
        if (j !== points.length - 1) {
          firstWayLength += Point.calculateDistance(points[j], points[j + 1]);
        }
        j = ixPlus(j, 1);
      }
    }

    j = i;
    while (true) {
      product = Point.calculateVectorProduct(
        p1,
        points[j],
        points[j],
        points[ixMinus(j, 1)],
      );
      if (positiveSign ? product < 0 : product > 0) {
        break;
      } else {
        j = ixMinus(j, 1);
      }
    }

    product = Point.calculateVectorProduct(p1, points[j], points[j], p2);
    if (positiveSign ? product >= 0 : product <= 0) {
      return [p1, p2];
    }

    if (
      Point.calculateDistance(p1, p2) <= Point.calculateDistance(p1, points[j])
    ) {
      product = Point.calculateVectorProduct(p1, p2, p1, points[i]);
      if (positiveSign ? product >= 0 : product <= 0) {
        return [p1, p2];
      }
    }

    let secondWayStartIx = j;
    let secondWayLastIx;
    let secondWayLength = Point.calculateDistance(p1, points[j]);

    while (true) {
      product = Point.calculateVectorProduct(
        points[j],
        p2,
        points[j],
        points[ixMinus(j, 1)],
      );
      if (positiveSign ? product <= 0 : product >= 0) {
        secondWayLength += Point.calculateDistance(points[j], p2);
        secondWayLastIx = j;
        break;
      } else {
        if (j !== 0) {
          secondWayLength += Point.calculateDistance(points[j], points[j - 1]);
        }
        j = ixMinus(j, 1);
      }
    }

    const result = [p1];
    const isFirstWayShorter = secondWayLength > firstWayLength;

    while (true) {
      result.push(
        points[isFirstWayShorter ? firstWayStartIx : secondWayStartIx],
      );

      if (
        isFirstWayShorter
          ? firstWayStartIx === firstWayLastIx
          : secondWayStartIx === secondWayLastIx
      ) {
        return [...result, p2];
      }

      if (isFirstWayShorter) {
        firstWayStartIx = ixPlus(firstWayStartIx, 1);
      } else {
        secondWayStartIx = ixMinus(secondWayStartIx, 1);
      }
    }
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
}
