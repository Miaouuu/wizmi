import { directionValue } from '../enums/Directions';
import { Condition } from '../interfaces/Condition';
import { Loop } from '../interfaces/Loop';
import { Movement } from '../interfaces/Movement';
import { Shape } from '../interfaces/Shape';
import { Square } from '../interfaces/Square';

export const isInside = (
  element: Movement | Condition | Loop,
  array: Array<Movement | Condition | Loop>,
): boolean => {
  const elementStringify = JSON.stringify(Object.entries(element).sort());
  const inside = array.findIndex((action) => {
    const actionStringify = JSON.stringify(Object.entries(action).sort());
    if (actionStringify !== elementStringify) {
      return false;
    }
    return true;
  });
  return inside !== -1;
};

export const changePlayerPosition = (
  direction: Array<number>,
  {
    start, shape, grid, infinity,
  }: {
    start: Array<number>;
    shape: Shape;
    grid: Array<Array<number>>;
    infinity: boolean;
  },
): Array<number> => {
  const [xInitial = 0, yInitial = 0] = start;
  let [x = 0, y = 0] = start;
  const [xDirection = 0, yDirection = 0] = direction;
  const { width, height } = shape;
  x += xDirection;
  y += yDirection;
  if (infinity) {
    x = x >= height ? x - height : x;
    x = x < 0 ? height + x : x;
    y = y >= width ? y - width : y;
    y = y < 0 ? width + y : y;
  } else {
    x = x >= height ? height - 1 : x;
    x = x < 0 ? 0 : x;
    y = y >= width ? width - 1 : y;
    y = y < 0 ? 0 : y;
  }
  const positionXInGrid = grid[x] ?? [1];
  const positionInGrid = positionXInGrid[y] ?? 1;
  if (positionInGrid === 1) {
    return [xInitial, yInitial];
  }
  return [x, y];
};

export const squareResolver = (
  square: Square,
  responses: Array<Movement | Condition | Loop>,
): boolean => {
  const { movements, conditions, loops } = square.actions;
  let { start } = square;
  const totalActions = movements.length + conditions.length + loops.length;
  if (totalActions !== responses.length) {
    return false;
  }
  for (const response of responses) {
    // INTERACTION TRIGGER OBJET
    // TESTER L'ORDER POUR SAVOIR LE PLUS RAPIDE
    const isMovement = isInside(response, movements);
    if (isMovement) {
      const movement = response as Movement;
      const direction = directionValue(movement.direction);
      for (let i = 0; i < movement.quantity; i++) {
        start = changePlayerPosition(
          direction,
          {
            start,
            shape: square.shape,
            grid: square.grid,
            infinity: square.infinity,
          },
        );
      }
      continue;
    }
    const isCondition = isInside(response, conditions);
    if (isCondition) {
      continue;
    }
    const isLoop = isInside(response, loops);
    if (isLoop) {
      continue;
    }
  }
  if (JSON.stringify(square.start) !== JSON.stringify(square.end)) {
    return false;
  }
  return true;
};
