import { Levels } from './Levels';

export interface CreateWorldInput{
  name: string
  value: number
}

export interface Worlds {
  id: number
  name: string
  value: number
  levels: Levels[]
}
