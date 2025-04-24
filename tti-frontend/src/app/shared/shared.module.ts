import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardActions, MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WorkspaceCardComponent } from './workspace-card/workspace-card.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatMenuModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatChipsModule,
  MatAutocompleteModule,
  DragDropModule,
  // MatMenuModule, MatIconModule, MatButtonModule
];

@NgModule({
  declarations: [
    WorkspaceCardComponent,
    ProjectCardComponent,
    CustomDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ...materialModules
  ],
  exports: [
    ...materialModules,
    WorkspaceCardComponent,
    ProjectCardComponent,
    TranslateModule
  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
