import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project } from '../../core/models/project.model';
import { MatDialog } from '@angular/material/dialog';
import { CustomDialogComponent } from '../custom-dialog/custom-dialog.component';
import { ProjectService } from '../../features/projects/services/project.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css'],
  standalone: false
})
export class ProjectCardComponent implements OnInit {
  @Input() project!: Project;
  @Output() projectChange = new EventEmitter<boolean>();
  constructor(private dialog: MatDialog, private projectService: ProjectService, private router: Router) { }

  ngOnInit() {

  }

  openDeleteDialog() {
    const dialogRef = this.dialog.open(CustomDialogComponent, {
      data: { title: 'Delete Project', message: 'Are you sure you want to delete this project?' }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService.deleteProject(this.project.id).subscribe(() => {
          this.projectChange.emit(true);
        });
      }
    });
  }
}
