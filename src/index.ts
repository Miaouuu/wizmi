import { squareResolver } from './services/resolver';
import { Direction } from './enums/Directions';
import { Square } from './interfaces/Square';
import Triggers from './enums/Triggers';
import Items from './enums/Items';

const data: Square = {
  start: [0, 0],
  end: [2, 2],
  shape: {
    width: 5,
    height: 5,
  },
  grid: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  infinity: true,
  actions: {
    movements: [{
      direction: Direction.Right,
      quantity: 1,
    },
    {
      direction: Direction.Right,
      quantity: 1,
    },
    {
      direction: Direction.Down,
      quantity: 1,
    }, {
      direction: Direction.Down,
      quantity: 1,
    }],
    conditions: [{
      condition: Triggers.Door,
      action: Items.Key,
    }],
    loops: [],
  },
  triggers: {
    doors: [
      {
        position: [0, 2],
        needKey: true,
        open: false,
      },
    ],
    ennemies: [],
  },
  items: {
    keys: [
      {
        position: [0, 1],
        taken: false,
        reusable: false,
      },
    ],
    swords: [],
  },
};

const x = squareResolver(data, [
  {
    direction: Direction.Right,
    quantity: 1,
  },
  {
    direction: Direction.Right,
    quantity: 1,
  },
  {
    condition: Triggers.Door,
    action: Items.Key,
  },
  {
    direction: Direction.Down,
    quantity: 1,
  }, {
    direction: Direction.Down,
    quantity: 1,
  },
]);
console.log(x);
