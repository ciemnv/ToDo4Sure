export interface User {
  id: string;
  email: string;
  token?: string;
  isGuest: boolean;
}


// Bezpieczny obiekt przesyłany podczas logowania (DTO)
export interface UserDto {
  email: string;
  password?: string;
  provider?: 'google' | 'apple';
}

export const GUEST_USER: User = {
  id: 'guest_local_device',
  email: 'gosc@todo4sure.local',
  isGuest: true
};