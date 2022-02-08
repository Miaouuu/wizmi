export interface CreateChangelogInput {
  title: string
  description: string
  author: string
  project: string
}

export interface Changelogs {
  id: number
  title: string
  description: string
  author: string
  project: string
  releaseId: number
  createdAt: string
}
