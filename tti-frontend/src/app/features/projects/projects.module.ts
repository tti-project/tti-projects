import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProjectsRoutingModule } from './projects-routing.module';
import { MainProjectsComponent } from './main-projects/main-projects.component';
import { SharedModule } from '../../shared/shared.module';
import { AddProjectDialogComponent } from './add-project-dialog/add-project-dialog.component';
import { ManageProjectComponent } from './manage-project/manage-project.component';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
@NgModule({
  declarations: [
    MainProjectsComponent,
    AddProjectDialogComponent,
    ManageProjectComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    CdkDropListGroup, CdkDropList, CdkDrag,
    // TasksModule
  ]
})
export class ProjectsModule {}
