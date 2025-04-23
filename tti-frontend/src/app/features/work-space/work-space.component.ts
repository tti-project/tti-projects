import { Component, OnInit } from '@angular/core';
import { Workspace, WorkspaceAdd } from '../../core/models/workspace.model';
import { AuthService } from '../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AddWorkspaceDialogComponent } from './add-workspace-dialog/add-workspace-dialog.component';
import { WorkspaceService } from './services/workspace.service';
@Component({
  selector: 'app-work-space',
  standalone: false,
  templateUrl: './work-space.component.html',
  styleUrl: './work-space.component.scss'
})
export class WorkSpaceComponent implements OnInit {
  workspaces: Workspace[] = [];
  isLoading = false;

  constructor(private authService: AuthService, private dialog: MatDialog, private workspaceService: WorkspaceService) {
    console.log(this.authService.getCurrentUser());
  }

  ngOnInit(): void {
    this.getWorkspaces();
  }

  getWorkspaces(): void {
    this.isLoading = true;
    this.workspaceService.getWorkspaces().subscribe((workspaces) => {
      this.workspaces = workspaces;
      this.isLoading = false;
    });
  }

  openDialog(workspace?: Workspace): void {
    let workspaceData = workspace ? { ...workspace } : null;
    if (!workspaceData) {
      workspaceData = {
        id: '',
        name: '',
        description: '',
        members: [],
        owner: this.authService.getCurrentUser()!
      }

    }
    const dialogRef = this.dialog.open(AddWorkspaceDialogComponent, {
      data: workspaceData,
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        this.getWorkspaces();
      }
    });
  }

  onWorkspaceClick(workspace: Workspace): void {
    this.openDialog(workspace);
  }

  deleteWorkspace(result: boolean): void {
    if (result) {
      this.getWorkspaces();
    }
  }
}
