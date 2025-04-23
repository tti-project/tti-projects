import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

interface TaskAssignmentData {
  taskId: string;
  taskTitle: string;
  projectName: string;
  assignedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: Socket;
  private readonly apiUrl = environment.apiUrl.replace('/api', ''); // Remove /api for WebSocket connection

  constructor() {
    this.socket = io(this.apiUrl, {
      withCredentials: true
    });
  }

  // Connect to the socket and join user's room
  connect(userId: string): void {
    this.socket.emit('join', userId);
  }

  // Listen for task assignment notifications
  onTaskAssigned(): Observable<TaskAssignmentData> {
    return new Observable(observer => {
      this.socket.on('taskAssigned', (data: TaskAssignmentData) => {
        observer.next(data);
      });
    });
  }

  // Disconnect from socket
  disconnect(): void {
    this.socket.disconnect();
  }
}
