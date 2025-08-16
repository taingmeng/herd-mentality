export const generateRandom7x7Grid = (): number[][] => {
  const N = 7;
  const grid: (number | null)[][] = Array.from({ length: N }, () => Array(N).fill(null));
  const center = Math.floor(N / 2);
  grid[center][center] = 0;

  const counts: Record<number, number> = {};
  for (let num = 1; num <= 8; num++) counts[num] = 6;

  const positions: [number, number][] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (r === center && c === center) continue;
      positions.push([r, c]);
    }
  }

  function shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffle(positions);

  function isValid(r: number, c: number, num: number): boolean {
    const deltas: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, dc] of deltas) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
        if (grid[nr][nc] === num) return false;
      }
    }
    return true;
  }

  function backtrack(i: number): boolean {
    if (i === positions.length) return true;

    const [r, c] = positions[i];
    const candidates: number[] = [];

    for (let num = 1; num <= 8; num++) {
      if (counts[num] > 0 && isValid(r, c, num)) {
        candidates.push(num);
      }
    }

    shuffle(candidates);

    for (const num of candidates) {
      grid[r][c] = num;
      counts[num]--;
      if (backtrack(i + 1)) return true;
      // backtrack
      grid[r][c] = null;
      counts[num]++;
    }

    return false;
  }

  const success = backtrack(0);
  if (!success) throw new Error('Failed to generate a valid grid');

  // At this point grid is number[][] without nulls
  // But typescript still sees possible nulls, so cast carefully:
  return grid.map(row => row.map(cell => cell as number));
}

export const allClustersConnected = (grid: number[][]): boolean => {
  const rows = grid.length;
  if (rows === 0) return true;
  const cols = grid[0].length;

  // Helper function: get neighbors orthogonally
  function getNeighbors(r: number, c: number): [number, number][] {
    const deltas: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const neighbors: [number, number][] = [];
    for (const [dr, dc] of deltas) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push([nr, nc]);
      }
    }
    return neighbors;
  }

  // Map number -> list of all positions of that number
  const positionsMap: Map<number, [number, number][]> = new Map();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r][c];
      if (!positionsMap.has(val)) {
        positionsMap.set(val, []);
      }
      positionsMap.get(val)!.push([r, c]);
    }
  }

  for (const [num, positions] of positionsMap.entries()) {
    if (positions.length === 1) continue; // Single cell cluster always connected

    // BFS to check connectivity of all same-number cells
    const start = positions[0];
    const queue: [number, number][] = [start];
    const visited: Set<string> = new Set([start.toString()]);

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      for (const [nr, nc] of getNeighbors(r, c)) {
        if (
          grid[nr][nc] === num &&
          !visited.has([nr, nc].toString())
        ) {
          visited.add([nr, nc].toString());
          queue.push([nr, nc]);
        }
      }
    }

    if (visited.size !== positions.length) {
      return false;
    }
  }

  return true;
}

export const countUniqueClusterShapes = (grid: number[][]): number => {
  const rows = grid.length;
  if (rows === 0) return 0;
  const cols = grid[0].length;

  type Point = [number, number];

  const deltas: Point[] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  const visited: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );

  function getClusters(): Point[][] {
    const clusters: Point[][] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!visited[r][c]) {
          const num = grid[r][c];
          const queue: Point[] = [[r, c]];
          visited[r][c] = true;
          const shape: Point[] = [];

          while (queue.length > 0) {
            const [x, y] = queue.shift()!;
            shape.push([x, y]);

            for (const [dx, dy] of deltas) {
              const nx = x + dx;
              const ny = y + dy;
              if (
                nx >= 0 &&
                nx < rows &&
                ny >= 0 &&
                ny < cols &&
                !visited[nx][ny] &&
                grid[nx][ny] === num
              ) {
                visited[nx][ny] = true;
                queue.push([nx, ny]);
              }
            }
          }

          clusters.push(shape);
        }
      }
    }

    return clusters;
  }

  function normalize(shape: Point[]): Point[] {
    const minX = Math.min(...shape.map((p) => p[0]));
    const minY = Math.min(...shape.map((p) => p[1]));
    return shape.map(([x, y]) => [x - minX, y - minY]);
  }

  function getTransformations(shape: Point[]): Point[][] {
    function rotate90(points: Point[]): Point[] {
      return points.map(([x, y]) => [y, -x]);
    }

    function flip(points: Point[]): Point[] {
      return points.map(([x, y]) => [x, -y]);
    }

    const transforms: Point[][] = [];
    let current = shape;

    for (let i = 0; i < 4; i++) {
      current = i === 0 ? shape : rotate90(current);
      transforms.push(normalize(current));
      transforms.push(normalize(flip(current)));
    }

    return transforms;
  }

  function shapeToStr(shape: Point[]): string {
    const sorted = shape
      .slice()
      .sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
    return sorted.map(([x, y]) => `$${x},$${y}`).join(";");
  }

  const clusters = getClusters();
  const uniqueShapes = new Set<string>();

  for (const cluster of clusters) {
    // Ignore single-cell clusters
    if (cluster.length === 1) continue;

    const normShape = normalize(cluster);
    const transformations = getTransformations(normShape);
    const canonicalForms = transformations.map(shapeToStr);
    const canonical = canonicalForms.reduce((a, b) => (a < b ? a : b));
    uniqueShapes.add(canonical);
  }

  return uniqueShapes.size;
}
