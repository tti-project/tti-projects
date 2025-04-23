import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Workspace } from '../../core/models/workspace.model';
import { Router } from '@angular/router';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceService } from '../../features/work-space/services/workspace.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
@Component({
  selector: 'app-workspace-card',
  standalone: false,
  templateUrl: './workspace-card.component.html',
  styleUrl: './workspace-card.component.scss'
})
export class WorkspaceCardComponent {
  @Input() workspace!: Workspace;
  @Output() handleClick = new EventEmitter<Workspace>();
  @Output() deleteWorkspace = new EventEmitter<boolean>();

  currentUser!: User;
  constructor(private router: Router, private dialog: MatDialog,
    private workspaceService: WorkspaceService, public authService: AuthService) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.currentUser = user;
      }
     }

  goToWorkspace() {
    this.router.navigate(['/projects', this.workspace.id]);
  }

  updateWorkspace(event: Event): void {
    event.stopPropagation();
    this.handleClick.emit(this.workspace);
  }

  openDeleteDialog() {
    const dialogRef = this.dialog.open(CustomDialogComponent, {
      data: { title: 'Delete Workspace', message: 'Are you sure you want to delete this workspace?' }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
          this.workspaceService.deleteWorkspace(this.workspace.id).subscribe(() => {
          this.deleteWorkspace.emit(true);
        });
      }
    });
  }


}
