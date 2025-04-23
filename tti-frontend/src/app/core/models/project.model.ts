import { User } from './user.model';

export interface Project {
  id: string;
  name: string;
  description: string;
  workspace: string;
  owner: User;
  members: User[];
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectAdd {
  name: string;
  description: string;
  workspace: string;
}
