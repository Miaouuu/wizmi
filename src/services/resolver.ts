import { Movement } from '../interfaces/Movement';
import { Condition } from '../interfaces/Condition';
import { Loop } from '../interfaces/Loop';
import { Square } from '../interfaces/Square';
import { directionValue } from '../enums/Directions';
import { Shape } from '../interfaces/Shape';
import Items from '../enums/Items';

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

// export const squareResolver = (
//   square: Square,
//   responses: Array<Movement | Condition | Loop>,
// ): boolean => {
//   const { movements, conditions, loops } = square.actions;
//   let { start, items, triggers } = square;
//   const totalActions = movements.length + conditions.length + loops.length;
//   if (totalActions !== responses.length) {
//     return false;
//   }
//   for (const response of responses) {
//     // eslint-disable-next-line @typescript-eslint/no-loop-func
//     items.keys = square.items.keys.map((key): Key => {
//       if (key.position[0] === start[0] && key.position[1] === start[1]) {
//         return {
//           ...key,
//           taken: true,
//         };
//       }
//       return key;
//     });
//     // eslint-disable-next-line @typescript-eslint/no-loop-func
//     items.swords = square.items.swords.map((sword): Sword => {
//       if (sword.position[0] === start[0] && sword.position[1] === start[1]) {
//         return {
//           ...sword,
//           taken: true,
//         };
//       }
//       return sword;
//     });
//     const isCondition = isInside(response, conditions);
//     if (isCondition) {
//       continue;
//     }
//     const isMovement = isInside(response, movements);
//     if (isMovement) {
//       const movement = response as Movement;
//       const direction = directionValue(movement.direction);
//       for (let i = 0; i < movement.quantity; i++) {
//         start = changePlayerPosition(
//           direction,
//           {
//             start,
//             shape: square.shape,
//             grid: square.grid,
//             infinity: square.infinity,
//           },
//         );
//       }
//       continue;
//     }
//     const isLoop = isInside(response, loops);
//     if (isLoop) {
//       continue;
//     }
//   }
//   if (JSON.stringify(square.start) !== JSON.stringify(square.end)) {
//     return false;
//   }
//   return true;
// };

export const squareResolver = (
  square: Square,
  responses: Array<Movement | Condition | Loop>,
): boolean => {
  // INIT
  let player = square.start;
  const { movements, conditions, loops } = square.actions;
  let { doors, ennemies } = square.triggers;
  let { keys, swords } = square.items;
  const totalActions = movements.length + conditions.length + loops.length;
  if (totalActions !== responses.length) {
    return false;
  }
  // LOOP TO START THE GAME
  let actualAction = 0;
  let actionResponseLoop: Loop = {
    condition: 0,
    block: 0,
  };
  const actionLoop: Loop = {
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
    keys = keys.map((key) => {
      if (key.position[0] === player[0] && key.position[1] === player[1]) {
        return {
          ...key,
          taken: true,
        };
      }
      return key;
    });
    swords = swords.map((sword) => {
      if (sword.position[0] === player[0] && sword.position[1] === player[1]) {
        return {
          ...sword,
          taken: true,
        };
      }
      return sword;
    });
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
      for (let i = 0; i < movement.quantity; i += 1) {
        player = changePlayerPosition(
          direction,
          {
            start: player,
            shape: square.shape,
            grid: square.grid,
            infinity: square.infinity,
          },
        );
      }
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
