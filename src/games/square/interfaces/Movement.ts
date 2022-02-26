import Direction from '../enums/Directions';

export interface Movement {
  id: number
  direction: Direction;
  quantity: number;
}
