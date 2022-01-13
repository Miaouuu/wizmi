import { Movement } from './Movement';

export interface Trigger {
  id: number
  position: number[];
}

export interface Door extends Trigger {
  needKey: boolean;
  open: boolean;
}

export interface Ennemy extends Trigger {
  loop: boolean;
  needSword: boolean;
  dead: boolean;
  movements: Movement[];
}
