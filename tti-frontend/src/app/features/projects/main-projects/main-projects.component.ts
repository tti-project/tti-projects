import { Component, inject, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../../../core/models/project.model';
import { WorkspaceService } from '../../work-space/services/workspace.service';
import { Workspace } from '../../../core/models/workspace.model';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddProjectDialogComponent } from '../add-project-dialog/add-project-dialog.component';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-main-projects',
  standalone: false,
  templateUrl: './main-projects.component.html',
  styleUrl: './main-projects.component.scss'
})
export class MainProjectsComponent implements OnInit {

  private projectService = inject(ProjectService);
  private workspaceService = inject(WorkspaceService);
  private dialog = inject(MatDialog);

  loading: boolean = true;

  projects: Project[] = [];
  workspaces: Workspace[] = [];

  selectedWorkspaceId: FormControl<string | null> = new FormControl('');

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      this.selectedWorkspaceId.setValue(params['id']);
      this.getProjects(params['id']);
    });
  }

  ngOnInit() {
    this.getWorkspaces();
    this.selectedWorkspaceId.valueChanges.subscribe((value) => {
      if (value) {
        this.getProjects(value);
      }
    });

  }

  getWorkspaces() {
    this.workspaceService.getWorkspaces().subscribe((workspaces) => {
      this.workspaces = workspaces;
      if (this.workspaces.length > 0 && !this.selectedWorkspaceId.value) {
        this.selectedWorkspaceId.setValue(this.workspaces[0].id);
      }
    });
  }

  getProjects(id: string) {
    this.loading = true;
    this.projectService.getProjects(id).subscribe((projects) => {
      this.projects = projects;
      this.loading = false;
    });
  }

  openDialog(project?: Project) {
    const dialogRef = this.dialog.open(AddProjectDialogComponent, {
      width: '500px',
      data: {
        project: project ?? null,
        workspaces: this.workspaces,
        workspaceId: this.selectedWorkspaceId.value
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getProjects(this.selectedWorkspaceId.value ?? '');
      }
    });
  }
}
