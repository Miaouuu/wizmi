import { Movement } from '../interfaces/Movement';
import { Condition } from '../interfaces/Condition';
import { Loop } from '../interfaces/Loop';
import { Square, SquareOptions } from '../interfaces/Square';
import Direction from '../enums/Directions';
import directionValue from './direction';
import { Shape } from '../interfaces/Shape';
import Items from '../enums/Items';
import { Item } from '../interfaces/Item';
import Triggers from '../enums/Triggers';
import { Actions } from '../types/Actions';

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

export const takeItems = (items: Item[], player: number[]): Item[] => items.map((item) => {
  if (item.position[0] === player[0] && item.position[1] === player[1]) {
    return {
      ...item,
      taken: true,
    };
  }
  return item;
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

export const squareResolver = (
  square: Square,
  responses: Actions[],
  options?: SquareOptions,
): boolean => {
  // INIT
  let player = square.start;
  const { movements, conditions, loops } = square.actions;
  let { doors, ennemies } = square.triggers;
  let { keys, swords } = square.items;
  const totalActions = movements.length + conditions.length + loops.length;
  if (totalActions !== responses.length && square.full) {
    return false;
  }
  const responsesWithLoops = checkLoops(responses, loops);
  for (const response of responsesWithLoops) {
    let triggerOn: Items;
    let blocked = false;

    keys = takeItems(keys, player);
    swords = takeItems(swords, player);

    // ! PERMET PAS DE GERER PLUSIEURS ITEM EN MEME TEMPS && NOT REUSABLE
    const isCondition = isInside(response, conditions);
    if (isCondition) {
      const condition = response as Condition;
      if (condition.action === Items.Key) {
        const hasKey = keys.findIndex((key) => key.taken);
        if (hasKey > -1) {
          keys.slice(hasKey, 1);
          triggerOn = Items.Key;
        }
      } else if (condition.action === Items.Sword) {
        const hasSword = keys.findIndex((sword) => sword.taken);
        if (hasSword > -1) {
          keys.slice(hasSword, 1);
          triggerOn = Items.Sword;
        }
      }
    }

    doors = doors.map((door) => {
      if (door.position[0] === player[0] && door.position[1] === player[1] && !blocked) {
        if (!door.open) {
          if (door.needKey) {
            if (triggerOn === Items.Key) {
              return {
                ...door,
                open: true,
              };
            }
            blocked = true;
          }
        }
      }
      return door;
    });

    // ! ENNEMIE NE BOUGE PAS
    ennemies = ennemies.map((ennemy) => {
      if (ennemy.position[0] === player[0] && ennemy.position[1] === player[1] && !blocked) {
        if (!ennemy.dead) {
          if (ennemy.needSword) {
            if (triggerOn === Items.Sword) {
              return {
                ...ennemy,
                dead: true,
              };
            }
            blocked = true;
          }
        }
      }
      return ennemy;
    });

    if (blocked) continue;

    const isMovement = isInside(response, movements);
    if (isMovement) {
      const movement = response as Movement;
      const direction = directionValue(movement.direction);
      const quantity = movement.quantity === -1 ? Infinity : movement.quantity;
      for (let i = 0; i < quantity; i += 1) {
        const optionsChangePlayerPosition = {
          start: player,
          shape: square.shape,
          grid: square.grid,
          infinity: square.infinity,
        };
        const newPlayerPosition = changePlayerPosition(direction, optionsChangePlayerPosition);
        if (newPlayerPosition[0] === player[0] && newPlayerPosition[1] === player[1]) break;
        player = newPlayerPosition;
      }
      if (options) options.cbPlayerPosition(player);
    }
  }
  // END
  if (JSON.stringify(player) !== JSON.stringify(square.end)) {
    return false;
  }
  return true;
};

const i: Square = {
  start: [
    0,
    0,
  ],
  end: [
    4,
    4,
  ],
  shape: {
    width: 5,
    height: 5,
  },
  grid: [
    [
      0,
      0,
      0,
      0,
      0,
    ],
    [
      0,
      1,
      1,
      0,
      0,
    ],
    [
      0,
      0,
      1,
      0,
      0,
    ],
    [
      0,
      1,
      0,
      0,
      1,
    ],
    [
      0,
      0,
      1,
      0,
      0,
    ],
  ],
  infinity: false,
  full: true,
  actions: {
    movements: [
      {
        id: 5,
        direction: Direction.Down,
        quantity: 3,
      },
      {
        id: 6,
        direction: Direction.Up,
        quantity: 3,
      },
      {
        id: 7,
        direction: Direction.Right,
        quantity: -1,
      },
      {
        id: 8,
        direction: Direction.Down,
        quantity: 1,
      },
      {
        id: 9,
        direction: Direction.Right,
        quantity: 1,
      },
      {
        id: 10,
        direction: Direction.Left,
        quantity: 1,
      },
      {
        id: 11,
        direction: Direction.Down,
        quantity: 2,
      },
      {
        id: 12,
        direction: Direction.Down,
        quantity: 1,
      },
      {
        id: 13,
        direction: Direction.Right,
        quantity: 1,
      },
    ],
    conditions: [
      {
        id: 14,
        condition: Triggers.Door,
        action: Items.Key,
      },
      {
        id: 15,
        condition: Triggers.Ennemy,
        action: Items.Sword,
      },
    ],
    loops: [],
  },
  triggers: {
    doors: [
      {
        id: 1,
        position: [0, 3],
        needKey: true,
        open: false,
      },
    ],
    ennemies: [
      {
        id: 2,
        position: [3, 3],
        loop: false,
        needSword: true,
        dead: false,
        movements: [],
      },
    ],
  },
  items: {
    keys: [
      {
        id: 3,
        position: [3, 0],
        taken: false,
        reusable: false,
      },
    ],
    swords: [
      {
        id: 4,
        position: [1, 4],
        taken: false,
        reusable: false,
      },
    ],
  },
};

const s = [
  {
    id: 6,
    direction: Direction.Up,
    quantity: 3,
  },
  {
    id: 7,
    direction: Direction.Right,
    quantity: -1,
  },
  {
    id: 14,
    condition: Triggers.Door,
    action: Items.Key,
  },
  {
    id: 5,
    direction: Direction.Down,
    quantity: 3,
  },
  {
    id: 8,
    direction: Direction.Down,
    quantity: 1,
  },
  {
    id: 9,
    direction: Direction.Right,
    quantity: 1,
  },
  {
    id: 10,
    direction: Direction.Left,
    quantity: 1,
  },
  {
    id: 11,
    direction: Direction.Down,
    quantity: 2,
  },
  {
    id: 15,
    condition: Triggers.Ennemy,
    action: Items.Sword,
  },
  {
    id: 12,
    direction: Direction.Down,
    quantity: 1,
  },
  {
    id: 13,
    direction: Direction.Right,
    quantity: 1,
  },
];

console.log(squareResolver(i, s));
