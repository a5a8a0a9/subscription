import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
	ACTIVITY_CATEGORIES,
	ACTIVITY_STATUS_LABELS,
	Activity,
	ActivityDraft,
	ActivityStatus,
	BillingCycle,
	BillingUnit,
} from '../../models/activity.model';

export interface ActivityFormData {
	item?: Activity;
}

@Component({
	selector: 'yo-activity-form-dialog',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatSlideToggleModule,
	],
	templateUrl: './activity-form-dialog.component.html',
	styleUrl: './activity-form-dialog.component.scss',
})
export class ActivityFormDialogComponent {
	readonly data = inject<ActivityFormData>(MAT_DIALOG_DATA);
	private readonly dialogRef = inject<MatDialogRef<ActivityFormDialogComponent, ActivityDraft>>(MatDialogRef);
	readonly categories = ACTIVITY_CATEGORIES;
	readonly statuses: ActivityStatus[] = ['active', 'paused', 'cancelled'];
	readonly statusLabels = ACTIVITY_STATUS_LABELS;
	readonly reminderOptions = [1, 3, 7, 14, 30];
	readonly form: FormGroup;

	constructor() {
		const item = this.data.item;
		const custom = item?.billingCycle.kind === 'custom' ? item.billingCycle : undefined;
		this.form = new FormGroup({
			name: new FormControl(item?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
			amount: new FormControl(item?.amount ?? 0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
			category: new FormControl(item?.category ?? '其他', { nonNullable: true, validators: [Validators.required] }),
			status: new FormControl<ActivityStatus>(item?.status ?? 'active', { nonNullable: true }),
			startDate: new FormControl(item?.startDate ?? '', { nonNullable: true, validators: [Validators.required] }),
			nextBillingDate: new FormControl(item?.nextBillingDate ?? '', { nonNullable: true, validators: [Validators.required] }),
			cycleKind: new FormControl<BillingCycle['kind']>(item?.billingCycle.kind ?? 'monthly', { nonNullable: true }),
			interval: new FormControl(custom?.interval ?? 1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
			unit: new FormControl<BillingUnit>(custom?.unit ?? 'month', { nonNullable: true }),
			reminderEnabled: new FormControl(item ? item.reminderDays !== null : true, { nonNullable: true }),
			reminderDays: new FormControl(item?.reminderDays ?? 3, { nonNullable: true }),
			website: new FormControl(item?.website ?? '', { nonNullable: true }),
			notes: new FormControl(item?.notes ?? '', { nonNullable: true, validators: [Validators.maxLength(500)] }),
		}, { validators: billingDateOrderValidator });
	}

	save(): void {
		if (this.form.invalid) return;
		const value = this.form.getRawValue();
		const billingCycle: BillingCycle = value.cycleKind === 'custom'
			? { kind: 'custom', interval: value.interval, unit: value.unit }
			: { kind: value.cycleKind };
		this.dialogRef.close({
			name: value.name.trim(),
			amount: Math.round(value.amount),
			category: value.category.trim(),
			status: value.status,
			startDate: value.startDate,
			nextBillingDate: value.nextBillingDate,
			billingCycle,
			reminderDays: value.reminderEnabled ? value.reminderDays : null,
			website: value.website.trim(),
			notes: value.notes.trim(),
		});
	}
}

function billingDateOrderValidator(control: AbstractControl): ValidationErrors | null {
	const startDate = control.get('startDate')?.value as string | undefined;
	const nextBillingDate = control.get('nextBillingDate')?.value as string | undefined;
	return startDate && nextBillingDate && startDate > nextBillingDate ? { billingDateOrder: true } : null;
}
