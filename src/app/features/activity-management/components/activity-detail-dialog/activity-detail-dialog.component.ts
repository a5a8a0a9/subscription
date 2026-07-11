import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ACTIVITY_STATUS_LABELS, Activity } from '../../models/activity.model';
import { cycleLabel } from '../../utils/billing-date.utils';

@Component({
	selector: 'yo-activity-detail-dialog',
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
	templateUrl: './activity-detail-dialog.component.html',
	styleUrl: './activity-detail-dialog.component.scss',
})
export class ActivityDetailDialogComponent {
	readonly item = inject<Activity>(MAT_DIALOG_DATA);
	readonly statusLabels = ACTIVITY_STATUS_LABELS;
	readonly cycleLabel = cycleLabel;
}
