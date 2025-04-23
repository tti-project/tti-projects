import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { WorkSpaceRoutingModule } from './work-space-routing.module';
import { WorkSpaceComponent } from './work-space.component';
import { SharedModule } from '../../shared/shared.module';
@NgModule({
  declarations: [
    WorkSpaceComponent
  ],
  imports: [
    CommonModule,
    WorkSpaceRoutingModule,
    SharedModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class WorkSpaceModule { }
