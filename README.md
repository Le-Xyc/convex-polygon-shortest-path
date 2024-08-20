# convex-polygon-shortest-path

A TypeScript program designed to find the shortest path between two points located outside a convex polygon, ensuring the path does not intersect the polygon itself.

## Description

For a detailed description of the task and the project's goals, see TASK.md.

## Input Format

The program requires an `input.txt` file in the `data` folder, formatted as follows:
- The first `n+1` lines should list the coordinates of the polygon's vertices, with the `(n+1)`th line repeating the first to close the polygon.
- Subsequent lines should contain four numbers each, representing two points (`x1 y1 x2 y2`). The program will determine the shortest path between these points, if possible.

Whitespaces between and around numbers are ignored, allowing for variations in spacing within the file.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# debug mode
$ npm run start:debug

# production mode
$ npm run start:prod
```

## Test

```bash
# e2e tests
$ npm run test:e2e
```
