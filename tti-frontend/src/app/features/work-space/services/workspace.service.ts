import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from '../../../core/models/workspace.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private apiUrl = `${environment.apiUrl}/workspaces`;

  constructor(private http: HttpClient) { }

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.apiUrl);
  }

  getWorkspace(id: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/${id}`);
  }

  createWorkspace(workspace: Partial<Workspace>): Observable<Workspace> {
    return this.http.post<Workspace>(this.apiUrl, workspace);
  }

  updateWorkspace(id: string, workspace: Partial<Workspace>): Observable<Workspace> {
    return this.http.put<Workspace>(`${this.apiUrl}/${id}`, workspace);
  }

  deleteWorkspace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getWorkspaceMembers(workspaceId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${workspaceId}/members`);
  }

  updateMemberRole(workspaceId: string, memberId: string, role: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${workspaceId}/members/${memberId}/role`, { role });
  }

  removeMember(workspaceId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${workspaceId}/members/${memberId}`);
  }

  inviteMember(workspaceId: string, email: string, role: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${workspaceId}/invitations`, { email, role });
  }
}
