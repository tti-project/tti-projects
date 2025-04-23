export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'guest';
  // createdAt: Date;
  // updatedAt: Date;
}
