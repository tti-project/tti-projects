import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { Project } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';
import { MatDialog } from '@angular/material/dialog';
import { TasksService } from '../../tasks/services/tasks.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomDialogComponent } from '../../../shared/custom-dialog/custom-dialog.component';

@Component({
  selector: 'app-manage-project',
  standalone: false,
  templateUrl: './manage-project.component.html',
  styleUrl: './manage-project.component.scss',

})
export class ManageProjectComponent implements OnInit {
  projectId: string = '';
  todo: Task[] = [];
  doing: Task[] = [];
  done: Task[] = [];
  project: Project | undefined;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private tasksService: TasksService,
    private snackBar: MatSnackBar
  ) {
    this.route.params.subscribe((params) => {
      this.projectId = params['id'];
      this.loadTasks();
    });
  }

  loadTasks() {
    this.tasksService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => {
        this.todo = tasks.filter(task => task.status === 'todo');
        this.doing = tasks.filter(task => task.status === 'doing');
        this.done = tasks.filter(task => task.status === 'done');
      },
      error: (error) => {
        this.snackBar.open('Error loading tasks', 'Close', {
          duration: 3000
        });
        console.error('Error loading tasks:', error);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // Update order for all tasks in the container
      const updates = event.container.data.map((task, index) => ({
        id: task.id,
        order: index,
        status: task.status
      }));

      // Update each task's order individually
      updates.forEach(update => {
        this.tasksService.updateTaskOrder(update.id, update.order, update.status).subscribe({
          next: () => {
            // No need to reload all tasks since we already have the updated order
          },
          error: (error) => {
            // Revert the local changes on error
            moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
            this.snackBar.open('Error updating task order', 'Close', {
              duration: 3000
            });
            console.error('Error updating task order:', error);
          }
        });
      });
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Get the new status for the moved task
      const newStatus = this.getStatusFromContainer(event.container);
      const movedTask = event.container.data[event.currentIndex];

      // Update the moved task's status and order
      this.tasksService.updateTaskOrder(movedTask.id, event.currentIndex, newStatus).subscribe({
        next: () => {
          // Update the local task status
          movedTask.status = newStatus;
        },
        error: (error) => {
          // Revert the local changes on error
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          this.snackBar.open('Error updating task status', 'Close', {
            duration: 3000
          });
          console.error('Error updating task status:', error);
        }
      });

      // Update orders for tasks in the previous container
      event.previousContainer.data.forEach((task, index) => {
        this.tasksService.updateTaskOrder(task.id, index, task.status).subscribe({
          error: (error) => {
            console.error('Error updating task order:', error);
          }
        });
      });

      // Update orders for tasks in the new container
      event.container.data.forEach((task, index) => {
        if (task.id !== movedTask.id) { // Skip the moved task as it's already updated
          this.tasksService.updateTaskOrder(task.id, index, task.status).subscribe({
            error: (error) => {
              console.error('Error updating task order:', error);
            }
          });
        }
      });
    }
  }

  private getStatusFromContainer(container: any): 'todo' | 'doing' | 'done' {
    if (container.id === 'todoList') return 'todo';
    if (container.id === 'doingList') return 'doing';
    if (container.id === 'doneList') return 'done';
    return 'todo'; // Default fallback
  }

  ngOnInit() {
    this.projectService.getProject(this.projectId).subscribe((project) => {
      this.project = project;
    });
  }

  openTaskForm(task?: Task) {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: {
        task: task,
        projectId: this.projectId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  deleteTask(task: Task) {
    const dialogRef = this.dialog.open(CustomDialogComponent, {
      data: { title: 'Delete Task', message: 'Are you sure you want to delete this task?' }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.tasksService.deleteTask(task.id).subscribe({
          next: () => {
            this.loadTasks();
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000
            });
          },
          error: (error) => {
            this.snackBar.open('Error deleting task', 'Close', {
              duration: 3000
            });
            console.error('Error deleting task:', error);
          }
        });
      }
    });
  }
}
