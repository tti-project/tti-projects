import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainProjectsComponent } from './main-projects/main-projects.component';
import { ManageProjectComponent } from './manage-project/manage-project.component';
const routes: Routes = [
  {
    path: '',
    component: MainProjectsComponent,
  },
  {
    path: ':id',
    component: MainProjectsComponent,
  },
  {
    path: ':id/tasks',
    component: ManageProjectComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
