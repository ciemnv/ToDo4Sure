export interface User {
  id: string;
  email: string;
  token?: string;
}


// Bezpieczny obiekt przesyłany podczas logowania (DTO)
export interface UserDto {
  email: string;
  password?: string;
  provider?: 'google' | 'apple';
}