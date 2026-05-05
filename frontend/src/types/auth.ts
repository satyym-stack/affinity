export type AuthUser = {
  id: number;
  email: string;
  username: string;
  display_name: string;
};

export type SignupPayload = {
  email: string;
  username: string;
  display_name: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};
