export enum Roles {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface Users{
  email: string
  username: string
  roles: Roles[]
}
