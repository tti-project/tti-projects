export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'guest';
  token: string;
}
