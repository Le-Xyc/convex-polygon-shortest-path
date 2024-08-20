import * as fs from 'fs';
import * as readline from 'readline';
import { Point } from './point';
import { ConvexPolygon } from './convex-polygon';

/**
 * Processes the input file to find the shortest path around a convex polygon.
 * @param {readline.Interface} lineReader - A readline interface for reading the input file.
 * @param {fs.WriteStream} outputStream - A write stream for writing to the output file.
 */
function solve(
  lineReader: readline.Interface,
  outputStream: fs.WriteStream,
): void {
  const points: Point[] = [];
  let polygon: ConvexPolygon;
  let testCaseNumber = 1;
  const writeMessage = (message: any) => outputStream.write(message + '\n');

  lineReader.on('line', (line) => {
    if (!polygon) {
      const point = Point.fromString(line) as Point;

      if (points.length > 0 && point.isEqual(points[0])) {
        try {
          polygon = new ConvexPolygon(points);
        } catch (error) {
          writeMessage(error.message);
          lineReader.close();
        }
      } else {
        points.push(point);
      }
    } else {
      let message = `Case #${testCaseNumber++}: `;
      try {
        message += polygon
          .findShortestPath(...(Point.fromString(line) as [Point, Point]))
          .join(' -> ');
      } catch (error) {
        message += error.message;
      }
      writeMessage(message);
    }
  });

  lineReader.on('close', () => {
    outputStream.end();
  });
}

function main() {
  const lineReader = readline.createInterface({
    input: fs.createReadStream('data/input.txt'),
  });
  const outputStream = fs.createWriteStream('data/output.txt');

  solve(lineReader, outputStream);
}

main();
