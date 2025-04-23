import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '../../services/invitation.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-send-invitation',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="send-invitation">
      <h2>Send Invitation</h2>
      <form [formGroup]="invitationForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required>
          <mat-error *ngIf="invitationForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="invitationForm.get('email')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role" required>
            <mat-option value="admin">Admin</mat-option>
            <mat-option value="member">Member</mat-option>
          </mat-select>
          <mat-error *ngIf="invitationForm.get('role')?.hasError('required')">
            Role is required
          </mat-error>
        </mat-form-field>

        <div class="actions">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="invitationForm.invalid || loading">
            {{ loading ? 'Sending...' : 'Send Invitation' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .send-invitation {
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
    }
    h2 {
      margin-bottom: 20px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class SendInvitationComponent implements OnInit {
  @Input() workspaceId!: string;
  invitationForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SendInvitationComponent>,
    private invitationService: InvitationService,
    private snackBar: MatSnackBar
  ) {
    this.invitationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['member', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.invitationForm.valid) {
      this.loading = true;
      const formData = this.invitationForm.value;

      this.invitationService.sendInvitation({
        email: formData.email,
        workspaceId: this.workspaceId,
        role: formData.role
      }).subscribe({
        next: () => {
          this.snackBar.open('Invitation sent successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Failed to send invitation', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
