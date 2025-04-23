import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

interface Notification {
  id: string;
  type: 'task_assigned' | 'invitation_received';
  data: {
    taskId?: string;
    taskTitle?: string;
    projectName?: string;
    assignedBy?: string;
    invitationId?: string;
    invitedBy?: string;
    role?: string;
  };
  read: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatMenuModule
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Connect to socket when component initializes
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.notificationService.connect(currentUser.id);

      // Subscribe to task assignment notifications
      this.subscription = this.notificationService.onTaskAssigned().subscribe(
        (data) => {
          const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'task_assigned',
            data,
            read: false,
            createdAt: new Date()
          };

          this.notifications.unshift(newNotification);
          this.unreadCount++;

          // Show snackbar for new notifications
          this.snackBar.open(
            `You have been assigned to task "${data.taskTitle}" in project "${data.projectName}" by ${data.assignedBy}`,
            'View',
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            }
          ).onAction().subscribe(() => {
            // Navigate to the task when user clicks "View"
            console.log('Navigate to task:', data.taskId);
          });
        }
      );

      // Subscribe to invitation received notifications
      this.subscription = this.notificationService.onInvitationReceived().subscribe(
        (data) => {
          const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'invitation_received',
            data,
            read: false,
            createdAt: new Date()
          };

          this.notifications.unshift(newNotification);
          this.unreadCount++;

          // Show snackbar for new notifications
          this.snackBar.open(
            `You have been invited to join project "${data.projectName}" by ${data.invitedBy}`,
            'View',
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            }
          ).onAction().subscribe(() => {
            // Navigate to the task when user clicks "View"
            console.log('Navigate to task:', data.invitationId);
          });
        }
      );
    }
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      notification.read = true;
      this.unreadCount--;
    }
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
      }
    });
    this.unreadCount = 0;
  }

  ngOnDestroy() {
    // Clean up subscription and disconnect from socket
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.notificationService.disconnect();
  }
}
