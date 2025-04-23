import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { Task, TaskAdd, TaskUpdate } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { ProjectService } from '../../projects/services/project.service';
import { TasksService } from '../services/tasks.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  form: FormGroup;
  projectMembers: User[] = [];
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task; projectId: string },
    private projectService: ProjectService,
    private tasksService: TasksService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      assignee: [''],
      dueDate: [null],
      priority: ['medium'],
      status: ['todo']
    });
  }

  ngOnInit() {
    this.loadProjectMembers();
    if (this.data.task) {
      this.isEditMode = true;
      this.form.patchValue({
        title: this.data.task.title,
        description: this.data.task.description,
        assignee: this.data.task.assignee?.id,
        dueDate: this.data.task.dueDate,
        priority: this.data.task.priority,
        status: this.data.task.status
      });
    }
  }

  loadProjectMembers() {
    this.projectService.getProjectMembers(this.data.projectId).subscribe({
      next: (members: User[]) => {
        this.projectMembers = members;
      },
      error: (error: Error) => {
        console.error('Error loading project members:', error);
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      // Remove assignee if it's an empty string
      if (formValue.assignee === '') {
        delete formValue.assignee;
      }
      const taskData: TaskAdd | TaskUpdate = {
        ...formValue,
        project: this.data.projectId
      };
      if (this.isEditMode && this.data.task?.id) {
        this.tasksService.updateTask(this.data.task.id, taskData).subscribe({
          next: () => {
            this.dialogRef.close(taskData);
          }
        });
      } else {
        // For createTask, we need to ensure taskData is of type TaskAdd
        // which requires the project property
        this.tasksService.createTask(taskData as TaskAdd).subscribe({
          next: () => {
            this.dialogRef.close(taskData);
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
