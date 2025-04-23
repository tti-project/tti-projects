import { Component, inject, model, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Workspace } from '../../../core/models/workspace.model';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { MatSelectModule } from '@angular/material/select';
import { WorkspaceService } from '../services/workspace.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-add-workspace-dialog',
  templateUrl: './add-workspace-dialog.component.html',
  styleUrls: ['./add-workspace-dialog.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
  ]
})
export class AddWorkspaceDialogComponent implements OnInit {
  @ViewChild('submitButton') submitButton!: ElementRef;

  readonly dialogRef = inject(MatDialogRef<AddWorkspaceDialogComponent>);
  readonly data = inject<Workspace>(MAT_DIALOG_DATA);
  private _snackBar = inject(MatSnackBar);
  users: User[] = [];

  form: FormGroup;
  constructor(private fb: FormBuilder, private authService: AuthService, private workspaceService: WorkspaceService) {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      members: [],
    });
  }


  ngOnInit(): void {
    if (this.data.id) {
      this.form.patchValue(this.data);
    } else {
      this.form.patchValue({
        members: [this.data.owner.id],
      });
    }
    this.getUsers();

  }

  getUsers(): void {
    console.log('current user:', this.authService.getCurrentUser());
    this.authService.getUsers().subscribe((users) => {
      this.users = users
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (this.data.id) {
        this.workspaceService.updateWorkspace(this.data.id, this.form.value).subscribe((workspace) => {
          this.dialogRef.close(workspace);
          this._snackBar.open('Workspace updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        });
      } else {
        this.workspaceService.createWorkspace(this.form.value).subscribe((workspace) => {
          this.dialogRef.close(workspace);
          this._snackBar.open('Workspace created successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        });
      }
    }
  }


}
