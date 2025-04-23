import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from '../../../core/models/workspace.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor(private http: HttpClient) { }

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${environment.apiUrl}/workspaces`);
  }

  createWorkspace(workspace: Workspace): Observable<Workspace> {
    return this.http.post<Workspace>(`${environment.apiUrl}/workspaces`, workspace);
  }

  updateWorkspace(workspace: Workspace): Observable<Workspace> {
    const { name, description, members } = workspace;
    return this.http.put<Workspace>(`${environment.apiUrl}/workspaces/${workspace.id.trim()}`, {
      name,
      description,
      members
    });
  }

  deleteWorkspace(id: string): Observable<Workspace> {
    return this.http.delete<Workspace>(`${environment.apiUrl}/workspaces/${id.trim()}`);
  }
}
