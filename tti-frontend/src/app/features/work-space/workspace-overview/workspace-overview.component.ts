import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { Workspace } from '../../../core/models/workspace.model';
import { MatDialog } from '@angular/material/dialog';
import { AddWorkspaceDialogComponent } from '../add-workspace-dialog/add-workspace-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-workspace-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatListModule,
    MatChipsModule
  ],
  template: `
    <div class="workspace-overview">
      <div class="header">
        <h1>Workspaces</h1>
        <div class="view-options">
          <button mat-icon-button (click)="viewMode = 'card'" [class.active]="viewMode === 'card'">
            <mat-icon>grid_view</mat-icon>
          </button>
          <button mat-icon-button (click)="viewMode = 'list'" [class.active]="viewMode === 'list'">
            <mat-icon>list</mat-icon>
          </button>
        </div>
        <button mat-raised-button color="primary" (click)="openAddWorkspaceDialog()">
          <mat-icon>add</mat-icon> New Workspace
        </button>
      </div>

      @if (viewMode === 'card') {
        <div class="card-grid">
          @for (workspace of workspaces; track workspace.id) {
            <mat-card class="workspace-card">
              <mat-card-header>
                <mat-card-title>{{ workspace.name }}</mat-card-title>
                <mat-card-subtitle>{{ workspace.description }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>Members: {{ workspace.members.length }}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary" (click)="navigateToWorkspace(workspace.id)">
                  Open
                </button>
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="editWorkspace(workspace)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="deleteWorkspace(workspace.id)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      } @else {
        <mat-list>
          @for (workspace of workspaces; track workspace.id) {
            <mat-list-item>
              <div matListItemTitle>{{ workspace.name }}</div>
              <div matListItemLine>{{ workspace.description }}</div>
              <div matListItemMeta>
                <mat-chip-set>
                  <mat-chip>{{ workspace.members.length }} members</mat-chip>
                </mat-chip-set>
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="navigateToWorkspace(workspace.id)">
                    <mat-icon>open_in_new</mat-icon>
                    <span>Open</span>
                  </button>
                  <button mat-menu-item (click)="editWorkspace(workspace)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="deleteWorkspace(workspace.id)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </div>
            </mat-list-item>
          }
        </mat-list>
      }
    </div>
  `,
  styles: [`
    .workspace-overview {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .view-options {
      display: flex;
      gap: 8px;
    }
    .view-options button.active {
      background-color: rgba(0, 0, 0, 0.04);
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .workspace-card {
      height: 100%;
    }
    mat-card-actions {
      display: flex;
      justify-content: space-between;
    }
  `]
})
export class WorkspaceOverviewComponent implements OnInit {
  workspaces: Workspace[] = [];
  viewMode: 'card' | 'list' = 'card';
  loading = true;

  constructor(
    private workspaceService: WorkspaceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.workspaceService.getWorkspaces().subscribe(
      workspaces => {
        this.workspaces = workspaces;
        this.loading = false;
      },
      error => {
        this.snackBar.open('Error loading workspaces', 'Close', { duration: 3000 });
        this.loading = false;
      }
    );
  }

  openAddWorkspaceDialog() {
    const dialogRef = this.dialog.open(AddWorkspaceDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWorkspaces();
      }
    });
  }

  editWorkspace(workspace: Workspace) {
    const dialogRef = this.dialog.open(AddWorkspaceDialogComponent, {
      width: '500px',
      data: { workspace }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWorkspaces();
      }
    });
  }

  deleteWorkspace(id: string) {
    if (confirm('Are you sure you want to delete this workspace?')) {
      this.workspaceService.deleteWorkspace(id).subscribe(
        () => {
          this.snackBar.open('Workspace deleted successfully', 'Close', { duration: 3000 });
          this.loadWorkspaces();
        },
        error => {
          this.snackBar.open('Error deleting workspace', 'Close', { duration: 3000 });
        }
      );
    }
  }

  navigateToWorkspace(id: string) {
    this.router.navigate(['/workspaces', id]);
  }
}
