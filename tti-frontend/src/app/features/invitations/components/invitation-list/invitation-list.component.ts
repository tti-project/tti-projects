import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '../../../../core/services/invitation.service';
import { Invitation } from '../../../../core/models/invitation.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule]
})
export class InvitationListComponent implements OnInit {
  invitations: Invitation[] = [];
  loading = false;

  constructor(
    private invitationService: InvitationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading = true;
    this.invitationService.getInvitations().subscribe({
      next: (invitations) => {
        this.invitations = invitations;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load invitations', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  acceptInvitation(invitation: Invitation): void {
    this.loading = true;
    this.invitationService.acceptInvitation(invitation.id).subscribe({
      next: () => {
        this.snackBar.open('Invitation accepted successfully', 'Close', { duration: 3000 });
        this.loadInvitations();
        this.router.navigate(['/workspaces', invitation.workspaceId]);
      },
      error: (error) => {
        this.snackBar.open('Failed to accept invitation', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  rejectInvitation(invitation: Invitation): void {
    this.loading = true;
    this.invitationService.rejectInvitation(invitation.id).subscribe({
      next: () => {
        this.snackBar.open('Invitation rejected successfully', 'Close', { duration: 3000 });
        this.loadInvitations();
      },
      error: (error) => {
        this.snackBar.open('Failed to reject invitation', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
