export enum Direction {
  Left = 'left',
  UpLeft = 'upleft',
  Up = 'up',
  UpRight = 'upright',
  Right = 'right',
  DownRight = 'downright',
  Down = 'down',
  DownLeft = 'downleft',
}

export const directionValue = (
  direction: Direction,
): Array<number> => {
  let movement = [0, 0];
  switch (direction) {
    case Direction.Left:
      movement = [0, -1];
      break;
    case Direction.UpLeft:
      movement = [-1, -1];
      break;
    case Direction.Up:
      movement = [-1, 0];
      break;
    case Direction.UpRight:
      movement = [-1, 1];
      break;
    case Direction.Right:
      movement = [0, 1];
      break;
    case Direction.DownRight:
      movement = [1, 1];
      break;
    case Direction.Down:
      movement = [1, 0];
      break;
    case Direction.DownLeft:
      movement = [1, -1];
      break;
    default:
      movement = [0, 0];
      break;
  }
  return movement;
};
