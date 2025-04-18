export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  birthYear?: string;
  role?: 'CREATOR' | 'MEMBER';
}