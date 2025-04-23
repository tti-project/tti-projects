import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export interface CustomDialogData {
  title: string;
  message: string;
}
@Component({
  selector: 'app-custom-dialog',
  standalone: false,
  templateUrl: './custom-dialog.component.html',
  styleUrl: './custom-dialog.component.scss'
})



export class CustomDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CustomDialogComponent>);
  readonly data: CustomDialogData = inject<CustomDialogData>(MAT_DIALOG_DATA);



  onSubmit() {
    this.dialogRef.close(true);
  }
}
