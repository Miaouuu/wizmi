import { Movement } from '../interfaces/Movement';
import { Condition } from '../interfaces/Condition';
import { Loop } from '../interfaces/Loop';
import { Square, SquareOptions } from '../interfaces/Square';
import { directionValue, Direction } from '../enums/Directions';
import { Shape } from '../interfaces/Shape';
import Items from '../enums/Items';
import { Item } from '../../../../build/games/square/interfaces/Item';

export const isInside = (
  element: Movement | Condition | Loop,
  array: (Movement | Condition | Loop)[],
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
  if (positionInGrid === 1) {
    return [xInitial, yInitial];
  }
  return [x, y];
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

export const squareResolver = (
  square: Square,
  responses: (Movement | Condition | Loop)[],
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
  // LOOP TO START THE GAME
  let actualAction = 0;
  let actionResponseLoop: Loop = {
    id: 0,
    condition: 0,
    block: 0,
  };
  const actionLoop: Loop = {
    id: 0,
    condition: 0,
    block: 0,
  };
  let initActionLoop = 0;

  while (actualAction < responses.length) {
    let triggerOn: Items;
    let blocked = false;
    let response;
    if (actionLoop.condition < actionResponseLoop.condition) {
      if (actionLoop.block === actionResponseLoop.block) {
        actionLoop.condition += 1;
        actionLoop.block = 0;
      }
      if (actionLoop.block < actionResponseLoop.block) {
        actionLoop.block += 1;
      }
      response = responses[initActionLoop + actionLoop.block];
      actualAction = initActionLoop;
    } else {
      response = responses[actualAction];
    }
    if (actionLoop.condition === actionResponseLoop.condition
      && actionLoop.block === actionResponseLoop.block
      && actionResponseLoop.condition !== 0) {
      actionResponseLoop.condition = 0;
      actualAction = initActionLoop + actionResponseLoop.block + 1;
      response = responses[actualAction];
    }
    if (!response) {
      actualAction += 1;
      continue;
    }
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

    // ! NE PEUT PAS BOUGER POUR L'INSTANT
    ennemies = ennemies.map((ennemy) => {
      if (ennemy.position[0] === player[0] && ennemy.position[1] === player[1] && !blocked) {
        if (!ennemy.dead) {
          if (ennemy.needSword) {
            blocked = triggerOn !== Items.Sword;
            if (blocked) {
              return {
                ...ennemy,
                open: true,
              };
            }
          }
        }
      }
      return ennemy;
    });
    if (blocked) {
      actualAction += 1;
      continue;
    }
    const isLoop = isInside(response, loops);
    // ! PERMET PAS DE FAIRE DES LOOP DANS DES LOOP
    if (isLoop) {
      const loop = response as Loop;
      initActionLoop = actualAction;
      actionResponseLoop = loop;
      continue;
    }
    const isMovement = isInside(response, movements);
    if (isMovement) {
      const movement = response as Movement;
      const direction = directionValue(movement.direction);
      const quantity = movement.quantity === -1 ? Infinity : movement.quantity;
      for (let i = 0; i < quantity; i += 1) {
        const newPlayerPosition = changePlayerPosition(
          direction,
          {
            start: player,
            shape: square.shape,
            grid: square.grid,
            infinity: square.infinity,
          },
        );
        if (newPlayerPosition[0] === player[0] && newPlayerPosition[1] === player[1]) {
          break;
        }
        player = newPlayerPosition;
      }
      if (options) options.cbPlayerPosition(player);
      actualAction += 1;
      continue;
    }
    actualAction += 1;
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
      1,
    ],
    [
      0,
      0,
      0,
      0,
      0,
    ],
    [
      0,
      0,
      0,
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
      1,
      0,
      0,
      0,
      0,
    ],
  ],
  infinity: false,
  actions: {
    movements: [
      {
        id: 1,
        direction: Direction.Right,
        quantity: 3,
      },
      {
        id: 2,
        direction: Direction.Left,
        quantity: 1,
      },
      {
        id: 3,
        direction: Direction.Down,
        quantity: -1,
      },
      {
        id: 4,
        direction: Direction.Right,
        quantity: 2,
      },
      {
        id: 5,
        direction: Direction.Down,
        quantity: 2,
      },
    ],
    conditions: [],
    loops: [],
  },
  triggers: {
    doors: [],
    ennemies: [],
  },
  items: {
    keys: [],
    swords: [],
  },
  full: false,
};

const responses = [
  {
    id: 1,
    direction: Direction.Right,
    quantity: 3,
  },
  {
    id: 3,
    direction: Direction.Down,
    quantity: -1,
  },
  {
    id: 4,
    direction: Direction.Right,
    quantity: 2,
  },
  {
    id: 5,
    direction: Direction.Down,
    quantity: 2,
  },
];

console.log(squareResolver(i, responses));
