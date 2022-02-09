import { Condition } from './Condition';
import { Key, Sword } from './Item';
import { Loop } from './Loop';
import { Movement } from './Movement';
import { Shape } from './Shape';
import { Door, Ennemy } from './Trigger';

export interface Square {
  start: number[];
  end: number[];
  shape: Shape;
  grid: number[][];
  infinity: boolean;
  full: boolean
  actions: SquareAction;
  triggers: SquareTrigger;
  items: SquareItem;
}

export interface SquareOptions {
  cbPlayerPosition: (playerPosition: number[]) => void
}

export interface SquareAction {
  movements: Movement[];
  conditions: Condition[];
  loops: Loop[];
}

export interface SquareTrigger {
  doors: Door[];
  ennemies: Ennemy[];
}

export interface SquareItem {
  keys: Key[];
  swords: Sword[];
}
