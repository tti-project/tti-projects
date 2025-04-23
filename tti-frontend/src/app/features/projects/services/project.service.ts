import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Project, ProjectAdd } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private http: HttpClient) { }

  getProjects(workspaceId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.apiUrl}/projects/workspace/${workspaceId}`);
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${environment.apiUrl}/projects/${id}`);
  }

  createProject(project: ProjectAdd): Observable<Project> {
    return this.http.post<Project>(`${environment.apiUrl}/projects`, project);
  }

  updateProject(project: Project): Observable<Project> {
    const { name, description, status = 'active', workspace } = project;
    return this.http.put<Project>(`${environment.apiUrl}/projects/${project.id.trim()}`, {
      name,
      description,
      status,
      workspace
    });
  }

  deleteProject(id: string): Observable<Project> {
    return this.http.delete<Project>(`${environment.apiUrl}/projects/${id.trim()}`);
  }
  getProjectMembers(projectId: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/projects/${projectId}/members`);
  }
}
