import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskAdd, TaskUpdate } from '../../../core/models/task.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) { }

  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createTask(task: TaskAdd): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: string, task: TaskUpdate): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  updateTaskOrder(taskId: string, order: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${taskId}/reorder`, { order, status });
  }

  updateTaskOrders(updates: { id: string; order: number; status: string }[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/batch/order`, { updates });
  }
}



