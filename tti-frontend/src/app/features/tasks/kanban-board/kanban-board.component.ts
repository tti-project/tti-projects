import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task } from '../../../core/models/task.model';
import { TasksService } from '../services/tasks.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskFormComponent } from '../task-form/task-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="kanban-board">
      <div class="board-header">
        <h1>Kanban Board</h1>
        <button mat-raised-button color="primary" (click)="openTaskForm()">
          <mat-icon>add</mat-icon> New Task
        </button>
      </div>

      <div class="board-container" cdkDropListGroup>
        <!-- To Do Column -->
        <div class="board-column" cdkDropList [cdkDropListData]="todo" (cdkDropListDropped)="drop($event)">
          <div class="column-header">
            <h2>To Do</h2>
            <span class="task-count">{{ todo.length }}</span>
          </div>
          <div class="task-list" *cdkDropListData="todo">
            @for (task of todo; track task.id) {
              <div class="task-card" cdkDrag [cdkDragData]="task">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ task.title }}</mat-card-title>
                    <mat-card-subtitle>
                      <mat-chip-set>
                        <mat-chip [class]="task.priority">{{ task.priority }}</mat-chip>
                      </mat-chip-set>
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>{{ task.description }}</p>
                    @if (task.assignee) {
                      <p>Assignee: {{ task.assignee.name }}</p>
                    }
                    @if (task.dueDate) {
                      <p>Due: {{ task.dueDate | date }}</p>
                    }
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="editTask(task)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item (click)="deleteTask(task.id)">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </mat-card-actions>
                </mat-card>
              </div>
            }
          </div>
        </div>

        <!-- Doing Column -->
        <div class="board-column" cdkDropList [cdkDropListData]="doing" (cdkDropListDropped)="drop($event)">
          <div class="column-header">
            <h2>Doing</h2>
            <span class="task-count">{{ doing.length }}</span>
          </div>
          <div class="task-list" *cdkDropListData="doing">
            @for (task of doing; track task.id) {
              <div class="task-card" cdkDrag [cdkDragData]="task">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ task.title }}</mat-card-title>
                    <mat-card-subtitle>
                      <mat-chip-set>
                        <mat-chip [class]="task.priority">{{ task.priority }}</mat-chip>
                      </mat-chip-set>
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>{{ task.description }}</p>
                    @if (task.assignee) {
                      <p>Assignee: {{ task.assignee.name }}</p>
                    }
                    @if (task.dueDate) {
                      <p>Due: {{ task.dueDate | date }}</p>
                    }
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="editTask(task)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item (click)="deleteTask(task.id)">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </mat-card-actions>
                </mat-card>
              </div>
            }
          </div>
        </div>

        <!-- Done Column -->
        <div class="board-column" cdkDropList [cdkDropListData]="done" (cdkDropListDropped)="drop($event)">
          <div class="column-header">
            <h2>Done</h2>
            <span class="task-count">{{ done.length }}</span>
          </div>
          <div class="task-list" *cdkDropListData="done">
            @for (task of done; track task.id) {
              <div class="task-card" cdkDrag [cdkDragData]="task">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ task.title }}</mat-card-title>
                    <mat-card-subtitle>
                      <mat-chip-set>
                        <mat-chip [class]="task.priority">{{ task.priority }}</mat-chip>
                      </mat-chip-set>
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>{{ task.description }}</p>
                    @if (task.assignee) {
                      <p>Assignee: {{ task.assignee.name }}</p>
                    }
                    @if (task.dueDate) {
                      <p>Due: {{ task.dueDate | date }}</p>
                    }
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="editTask(task)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item (click)="deleteTask(task.id)">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </mat-card-actions>
                </mat-card>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-board {
      padding: 20px;
      height: calc(100vh - 64px);
      overflow: hidden;
    }
    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .board-container {
      display: flex;
      gap: 20px;
      height: calc(100% - 80px);
      overflow-x: auto;
    }
    .board-column {
      flex: 1;
      min-width: 300px;
      background: #f5f5f5;
      border-radius: 4px;
      padding: 10px;
      display: flex;
      flex-direction: column;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: white;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .task-count {
      background: #e0e0e0;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
    .task-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    .task-card {
      margin-bottom: 10px;
      cursor: move;
    }
    .task-card.cdk-drag-preview {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
                  0 8px 10px 1px rgba(0,0,0,0.14),
                  0 3px 14px 2px rgba(0,0,0,0.12);
    }
    .task-card.cdk-drag-placeholder {
      opacity: 0.3;
    }
    .task-card.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .task-list.cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    mat-card {
      margin-bottom: 10px;
    }
    mat-card-actions {
      display: flex;
      justify-content: flex-end;
    }
    .low {
      background-color: #4caf50;
      color: white;
    }
    .medium {
      background-color: #ff9800;
      color: white;
    }
    .high {
      background-color: #f44336;
      color: white;
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  todo: Task[] = [];
  doing: Task[] = [];
  done: Task[] = [];
  loading = true;

  constructor(
    private tasksService: TasksService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.tasksService.getTasksByProject('project-id').subscribe(
      tasks => {
        this.todo = tasks.filter(task => task.status === 'todo');
        this.doing = tasks.filter(task => task.status === 'doing');
        this.done = tasks.filter(task => task.status === 'done');
        this.loading = false;
      },
      error => {
        this.snackBar.open('Error loading tasks', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const task = event.item.data;
    const newStatus = this.getStatusFromContainer(event.container.id);
    const newOrder = event.currentIndex;

    this.tasksService.updateTaskOrder(task.id, newOrder, newStatus).subscribe(
      () => {
        // Task updated successfully
      },
      error => {
        this.snackBar.open('Error updating task', 'Close', { duration: 3000 });
        // Revert the change
        this.loadTasks();
      }
    );
  }

  getStatusFromContainer(containerId: string): string {
    switch (containerId) {
      case 'todo':
        return 'todo';
      case 'doing':
        return 'doing';
      case 'done':
        return 'done';
      default:
        return 'todo';
    }
  }

  openTaskForm(task?: Task) {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  editTask(task: Task) {
    this.openTaskForm(task);
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasksService.deleteTask(id).subscribe(
        () => {
          this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
          this.loadTasks();
        },
        error => {
          this.snackBar.open('Error deleting task', 'Close', { duration: 3000 });
        }
      );
    }
  }
}
