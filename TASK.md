# Convex Polygon Shortest Path Challenge

## Description

This task involves developing a program to find the shortest path between two points located outside of a convex polygon, ensuring the path does not intersect the polygon.

## Input

The input file must adhere to the following format:
- The first `n+1` lines contain the coordinates of the polygon's vertices, with the `(n+1)`-th line repeating the first to close the polygon.
- Subsequent lines should contain four numbers each, representing two points (`x1 y1 x2 y2`), for which the shortest path is to be determined.

Whitespaces between and around numbers are ignored.

## Output

For each test case, output one line containing `Case #x: y`, where `x` is the test case number (starting from 1) and `y` is:
- One of the following messages if an error is encountered:
  - "A polygon must have at least three points."
  - "The points do not form a convex polygon."
  - "The first point is inside the polygon."
  - "The second point is inside the polygon."
- The shortest path in the format `(x1, y1) -> (x2, y2) -> ... -> (xn, yn)` if a valid path exists.

## Example

### Input

0 0       
0 10        
10 10       
10 0      
0 0          
-5 5 5 0      
2 3 10 11       
0 0 15 15

### Answer
Case #1: (-5, 5) -> (0, 0) -> (5, 0)      
Case #2: The first point is inside the polygon.     
Case #3: (0, 0) -> (0, 10) -> (15, 15)

