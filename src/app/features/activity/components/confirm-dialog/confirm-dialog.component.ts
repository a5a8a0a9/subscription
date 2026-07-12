import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
	title: string;
	message: string;
	confirmText: string;
}

@Component({
	selector: 'yo-confirm-dialog',
	standalone: true,
	host: { class: 'd-block' },
	imports: [MatDialogModule, MatButtonModule],
	templateUrl: './confirm-dialog.component.html',
	styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
	readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
