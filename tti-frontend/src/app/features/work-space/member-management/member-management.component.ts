import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { User } from '../../../core/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-member-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="member-management">
      <div class="header">
        <h1>Member Management</h1>
        <button mat-raised-button color="primary" (click)="openInviteDialog()">
          <mat-icon>person_add</mat-icon> Invite Member
        </button>
      </div>

      <div class="search-bar">
        <mat-form-field>
          <mat-label>Search Members</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name or email">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <table mat-table [dataSource]="filteredMembers" class="mat-elevation-z8">
        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let member">{{ member.name }}</td>
        </ng-container>

        <!-- Email Column -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let member">{{ member.email }}</td>
        </ng-container>

        <!-- Role Column -->
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Role</th>
          <td mat-cell *matCellDef="let member">
            <mat-form-field>
              <mat-select [value]="member.role" (selectionChange)="updateRole(member, $event.value)">
                <mat-option value="admin">Admin</mat-option>
                <mat-option value="member">Member</mat-option>
              </mat-select>
            </mat-form-field>
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let member">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="removeMember(member)">
                <mat-icon>remove_circle</mat-icon>
                <span>Remove</span>
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <!-- Invite Dialog -->
      <div class="invite-dialog" *ngIf="showInviteDialog">
        <h2>Invite New Member</h2>
        <form [formGroup]="inviteForm" (ngSubmit)="submitInvite()">
          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email">
            <mat-error *ngIf="inviteForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="inviteForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="admin">Admin</mat-option>
              <mat-option value="member">Member</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="dialog-actions">
            <button mat-button (click)="closeInviteDialog()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="inviteForm.invalid">
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .member-management {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .search-bar {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
    .invite-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class MemberManagementComponent implements OnInit {
  members: User[] = [];
  filteredMembers: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'actions'];
  showInviteDialog = false;
  inviteForm: FormGroup;

  constructor(
    private workspaceService: WorkspaceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['member', Validators.required]
    });
  }

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.workspaceService.getWorkspaceMembers('workspace-id').subscribe(
      members => {
        this.members = members;
        this.filteredMembers = members;
      },
      error => {
        this.snackBar.open('Error loading members', 'Close', { duration: 3000 });
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredMembers = this.members.filter(member =>
      member.name.toLowerCase().includes(filterValue) ||
      member.email.toLowerCase().includes(filterValue)
    );
  }

  updateRole(member: User, newRole: string) {
    this.workspaceService.updateMemberRole('workspace-id', member.id, newRole).subscribe(
      () => {
        this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
        this.loadMembers();
      },
      error => {
        this.snackBar.open('Error updating role', 'Close', { duration: 3000 });
      }
    );
  }

  removeMember(member: User) {
    if (confirm(`Are you sure you want to remove ${member.name} from the workspace?`)) {
      this.workspaceService.removeMember('workspace-id', member.id).subscribe(
        () => {
          this.snackBar.open('Member removed successfully', 'Close', { duration: 3000 });
          this.loadMembers();
        },
        error => {
          this.snackBar.open('Error removing member', 'Close', { duration: 3000 });
        }
      );
    }
  }

  openInviteDialog() {
    this.showInviteDialog = true;
  }

  closeInviteDialog() {
    this.showInviteDialog = false;
    this.inviteForm.reset();
  }

  submitInvite() {
    if (this.inviteForm.valid) {
      const { email, role } = this.inviteForm.value;
      this.workspaceService.inviteMember('workspace-id', email, role).subscribe(
        () => {
          this.snackBar.open('Invitation sent successfully', 'Close', { duration: 3000 });
          this.closeInviteDialog();
        },
        error => {
          this.snackBar.open('Error sending invitation', 'Close', { duration: 3000 });
        }
      );
    }
  }
}
