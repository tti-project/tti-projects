import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainTasksComponent } from './main-tasks/main-tasks.component';
const routes: Routes = [
  {
    path: '',
    component: MainTasksComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
