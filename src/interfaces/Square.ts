import { Condition } from './Condition';
import { Key, Sword } from './Item';
import { Loop } from './Loop';
import { Movement } from './Movement';
import { Shape } from './Shape';
import { Door, Ennemy } from './Trigger';

export interface Square {
  start: Array<number>;
  end: Array<number>;
  shape: Shape;
  grid: Array<Array<number>>;
  infinity: boolean;
  actions: SquareAction;
  triggers: SquareTrigger;
  items: SquareItem;
}

export interface SquareAction {
  movements: Array<Movement>;
  conditions: Array<Condition>;
  loops: Array<Loop>;
}

export interface SquareTrigger {
  doors: Array<Door>;
  ennemies: Array<Ennemy>;
}

export interface SquareItem {
  keys: Array<Key>;
  swords: Array<Sword>;
}
