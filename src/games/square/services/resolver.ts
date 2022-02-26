import { Movement } from '../interfaces/Movement';
import { Condition } from '../interfaces/Condition';
import { Loop } from '../interfaces/Loop';
import { Square, SquareOptions } from '../interfaces/Square';
import directionValue from './direction';
import { Shape } from '../interfaces/Shape';
import Items from '../enums/Items';
import { Item } from '../interfaces/Item';
import { Key } from '../types/Key';
import { Sword } from '../types/Sword';
import Triggers from '../enums/Triggers';
import { Actions } from '../types/Actions';
import { Door, Ennemy } from '../interfaces/Trigger';

export const isInside = (
  element: Actions,
  array: Actions[],
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
  direction: number[],
  {
    start, shape, grid, infinity,
  }: {
    start: number[];
    shape: Shape;
    grid: number[][];
    infinity: boolean;
  },
): number[] => {
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
  return positionInGrid === 1 ? [xInitial, yInitial] : [x, y];
};

export const takeItems = (items: Item[], player: number[], lastMove: boolean): Item[] => (
  items.map((item) => {
    if (item.position[0] === player[0] && item.position[1] === player[1]) {
      if (item.onWalk || (!item.onWalk === lastMove)) {
        return {
          ...item,
          taken: true,
        };
      }
    }
    return item;
  }));

export const checkDoors = (
  doors: Door[],
  player: number[],
): [Triggers.Door | undefined, number] => {
  const doorIndex = doors.findIndex((door) => {
    if (door.position[0] === player[0] && door.position[1] === player[1] && !door.open) {
      return true;
    }
    return false;
  });
  return [doorIndex === -1 ? undefined : Triggers.Door, doorIndex];
};

export const checkEnnemies = (
  ennemies: Ennemy[],
  player: number[],
): [Triggers.Ennemy | undefined, number] => {
  const ennemyIndex = ennemies.findIndex((ennemy) => {
    if (ennemy.position[0] === player[0] && ennemy.position[1] === player[1] && !ennemy.dead) {
      return true;
    }
    return false;
  });
  return [ennemyIndex === -1 ? undefined : Triggers.Ennemy, ennemyIndex];
};

export const moveEnnemies = (
  ennemies: Ennemy[],
  optionsChangePosition: {
    start: number[];
    shape: Shape;
    grid: number[][];
    infinity: boolean;
  },
): Ennemy[] => ennemies.map((ennemy) => {
  const { movements, dead, loop } = ennemy;
  let { position } = ennemy;
  if (movements.length === 0 || dead) return ennemy;
  const movement = movements.shift() as Movement;
  const direction = directionValue(movement.direction);
  const options = {
    ...optionsChangePosition,
    start: position,
  };
  const quantity = movement.quantity === -1 ? Infinity : movement.quantity;
  for (let i = 0; i < quantity; i += 1) {
    position = changePlayerPosition(direction, options);
  }
  if (loop) {
    movements.push(movement);
  }
  return {
    ...ennemy,
    position,
    movements,
  };
});

export const checkLoops = (responses: Actions[], loops: Loop[]) => {
  const loopUntilTheEnd = true;
  const responsesReversed: unknown[] = responses.reverse();
  while (loopUntilTheEnd) {
    const loopIndex = responsesReversed.findIndex((res) => isInside(res as Actions, loops));
    if (loopIndex === -1) break;
    const { condition, block } = responsesReversed[loopIndex] as Loop;
    const blockToInsert = responsesReversed.slice(loopIndex - block, loopIndex);
    const arrayToInsert = new Array(condition).fill(blockToInsert).flat(2);
    responsesReversed.splice(loopIndex - block, block + 1, arrayToInsert);
  }
  return responsesReversed.flat().reverse() as Actions[];
};

export const isCondition = (action: Actions): action is Condition => 'action' in action;

export const squareResolver = (
  square: Square,
  responses: Actions[],
  options?: SquareOptions,
): boolean => {
  let player = square.start;
  const { movements, conditions, loops } = square.actions;
  const { doors } = square.triggers;
  let { ennemies } = square.triggers;
  let { keys, swords } = square.items;
  const totalActions = movements.length + conditions.length + loops.length;
  if (totalActions !== responses.length && square.full) {
    return false;
  }
  const responsesWithLoops = checkLoops(responses, loops);
  for (const [indexResponse, response] of responsesWithLoops.entries()) {
    const isMovement = isInside(response, movements);
    if (isMovement) {
      const movement = response as Movement;
      const direction = directionValue(movement.direction);
      const quantity = movement.quantity === -1 ? Infinity : movement.quantity;
      const optionsChangePlayerPosition = {
        start: player,
        shape: square.shape,
        grid: square.grid,
        infinity: square.infinity,
      };
      ennemies = moveEnnemies(ennemies, optionsChangePlayerPosition);
      for (let i = 0; i < quantity; i += 1) {
        optionsChangePlayerPosition.start = player;
        const newPlayerPosition = changePlayerPosition(direction, optionsChangePlayerPosition);
        if (newPlayerPosition[0] === player[0] && newPlayerPosition[1] === player[1]) break;
        let [trigger, triggerIndex]:
        [Triggers | undefined, number] = checkDoors(doors, newPlayerPosition);
        if (!trigger) {
          [trigger, triggerIndex] = checkEnnemies(ennemies, newPlayerPosition);
        }
        if (trigger) {
          if (triggerIndex === -1) break;
          const nextResponse = responsesWithLoops[indexResponse + 1];
          if (!nextResponse) break;
          if (!isCondition(nextResponse)) break;
          if (!isInside(nextResponse, conditions)) break;
          const { condition } = nextResponse;
          if (condition !== trigger) break;
          const { action } = nextResponse;
          if (action === Items.Key) {
            const keyIndex = keys.findIndex((k) => k.taken);
            if (keyIndex === -1) break;
            const key = keys[keyIndex] as Key;
            if (!key.reusable) {
              keys.splice(keyIndex, 1);
            }
          } else {
            const swordIndex = swords.findIndex((s) => s.taken);
            if (swordIndex === -1) break;
            const sword = swords[swordIndex] as Sword;
            if (!sword.reusable) {
              swords.splice(swordIndex, 1);
            }
          }
          if (trigger === Triggers.Door) {
            const door = doors[triggerIndex] as Door;
            if (!door.needKey) break;
            doors[triggerIndex] = {
              ...door,
              open: true,
            };
          } else {
            const ennemy = ennemies[triggerIndex] as Ennemy;
            if (!ennemy.needSword) break;
            ennemies[triggerIndex] = {
              ...ennemy,
              dead: true,
            };
          }
        }
        player = newPlayerPosition;
        const lastMove = i + 1 === quantity;
        keys = takeItems(keys, player, lastMove);
        swords = takeItems(swords, player, lastMove);
      }
      if (options) options.cbPlayerPosition(player);
    }
  }
  if (JSON.stringify(player) !== JSON.stringify(square.end)) {
    return false;
  }
  return true;
};
