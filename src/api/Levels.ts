import { Square } from '../games/square';

export enum Types{
  SQUARE = 'SQUARE',
}

export interface CreateLevelInput{
  name: string
  reward: string
  data: string
  worldId: number
  type: string
}

export interface FindLevelParams{
  id: number
}

export interface Levels{
  id: number
  name: string
  reward: string
  worldId: number
  data: Square
  type: Types
}
