import { User } from './user.model';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  owner: User;
  members: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkspaceAdd {
  name: string;
  description: string;
  members: string[];
}
