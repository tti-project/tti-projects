export interface Invitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterId: string;
  inviterName: string;
  inviteeEmail: string;
  role: string;
  invitedBy: InvitedBy;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitedBy {
  email: string;
  name: string;
}
