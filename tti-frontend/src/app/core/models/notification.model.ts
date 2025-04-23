export interface TaskAssignmentData {
  taskId: string;
  taskTitle: string;
  projectName: string;
  assignedBy: string;
}

export interface InvitationReceivedData {
  invitationId: string;
  projectName: string;
  workspaceName: string;
  invitedBy: string;
  role: string;
}
