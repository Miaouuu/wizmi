import { Changelogs } from './Changelogs';

export interface Releases {
  id: number
  title: string
  changelogs?: Changelogs[]
  createdAt: string
}

export interface FindReleaseParams {
  id: number
}

export interface CreateReleaseInput {
  title: string
}
