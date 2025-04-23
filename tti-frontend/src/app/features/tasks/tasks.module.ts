import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksRoutingModule } from './tasks-routing.module';
import { MainTasksComponent } from './main-tasks/main-tasks.component';
import { TaskFormComponent } from './task-form/task-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '../../shared/shared.module';
@NgModule({
  declarations: [
    MainTasksComponent,
    // TaskFormComponent
  ],
  imports: [
    CommonModule,
    TasksRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
  ],

})
export class TasksModule { }
