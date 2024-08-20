import * as fs from 'fs';
import * as readline from 'readline';
import { Point } from './point';
import { ConvexPolygon } from './convex-polygon';

function solve(
  lineReader: readline.Interface,
  outputStream: fs.WriteStream,
): void {
  const points: Point[] = [];
  let polygon: ConvexPolygon;
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
      try {
        const shortestPath = polygon.findShortestPath(
          ...(Point.fromString(line) as [Point, Point]),
        );
        console.log(new ConvexPolygon(shortestPath));
        writeMessage(`Length of the shortest path is ${shortestPath}.`);
      } catch (error) {
        writeMessage(error.message);
      }
    }
  });

  lineReader.on('close', () => {
    outputStream.end();
  });
}

function main() {
  const lineReader = readline.createInterface({
    input: fs.createReadStream('input.txt'),
  });
  const outputStream = fs.createWriteStream('output.txt');

  solve(lineReader, outputStream);
}

main();
