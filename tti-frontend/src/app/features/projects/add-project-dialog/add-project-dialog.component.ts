import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Project } from '../../../core/models/project.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from '../services/project.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Workspace } from '../../../core/models/workspace.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-project-dialog',
  templateUrl: './add-project-dialog.component.html',
  styleUrls: ['./add-project-dialog.component.css'],
  standalone: false,
})
export class AddProjectDialogComponent implements OnInit {


  @Output() projectChange = new EventEmitter<Project>();
  readonly dialogRef = inject(MatDialogRef<AddProjectDialogComponent>);
  readonly data = inject<{ project: Project, workspaces: Workspace[], workspaceId: string }>(MAT_DIALOG_DATA);
  private _snackBar = inject(MatSnackBar);
  form!: FormGroup;

  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      workspace: [this.data.workspaceId, Validators.required],
    });
  }

  ngOnInit() {
    if (this.data.project) {
      this.form.patchValue(this.data.project);
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.form.valid) {
      this.projectService[this.data.project ? 'updateProject' : 'createProject'](this.form.value).subscribe((project) => {
        this.projectChange.emit(project);
        this.dialogRef.close(true);
        this._snackBar.open(this.data.project ? 'Project updated successfully' : 'Project created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      });
    }
  }
}
