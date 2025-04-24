import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaskOverTime {
  date: string;
  count: number;
}

export interface ProjectMemberStats {
  name: string;
  memberCount: number;
}

export interface TaskStatusStats {
  _id: string;
  count: number;
}

export interface TaskPriorityStats {
  _id: string;
  count: number;
}

export interface UserActivityStats {
  _id: string;
  name: string;
  email: string;
  taskCount: number;
  completedTasks: number;
  completionRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) {}

  // Get task creation statistics over time
  getTasksOverTime(): Observable<TaskOverTime[]> {
    return this.http.get<TaskOverTime[]>(`${this.apiUrl}/tasks-over-time`);
  }

  // Get project member distribution
  getProjectMemberStats(): Observable<ProjectMemberStats[]> {
    return this.http.get<ProjectMemberStats[]>(`${this.apiUrl}/project-members`);
  }

  // Get task status distribution
  getTaskStatusStats(): Observable<TaskStatusStats[]> {
    return this.http.get<TaskStatusStats[]>(`${this.apiUrl}/task-status`);
  }

  // Get task priority distribution
  getTaskPriorityStats(): Observable<TaskPriorityStats[]> {
    return this.http.get<TaskPriorityStats[]>(`${this.apiUrl}/task-priority`);
  }

  // Get user activity statistics
  getUserActivityStats(): Observable<UserActivityStats[]> {
    return this.http.get<UserActivityStats[]>(`${this.apiUrl}/user-activity`);
  }
}
