export interface RegisterUserInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface Token{
  token: string
}
