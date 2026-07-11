import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import {
	ACTIVITY_CATEGORIES,
	ACTIVITY_STATUS_LABELS,
	Activity,
	ActivityDraft,
	ActivityStatus,
	BillingCycle,
	BillingUnit,
} from '../core/activity.model';
import { cycleLabel } from '../core/billing-date.utils';

export interface ActivityFormData {
	item?: Activity;
}

@Component({
	selector: 'yo-activity-form-dialog',
	standalone: true,
	imports: [
		CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
		MatInputModule, MatSelectModule, MatSlideToggleModule,
	],
	template: `
		<h2 mat-dialog-title>{{ data.item ? '編輯訂閱' : '新增訂閱' }}</h2>
		<form [formGroup]="form" (ngSubmit)="save()">
			<mat-dialog-content class="form-content">
				<div class="row g-3">
					<mat-form-field appearance="outline" class="col-12 col-md-7">
						<mat-label>名稱</mat-label>
						<input matInput formControlName="name" maxlength="80" />
						@if (form.controls['name'].invalid) { <mat-error>請輸入名稱</mat-error> }
					</mat-form-field>
					<mat-form-field appearance="outline" class="col-12 col-md-5">
						<mat-label>金額 (TWD)</mat-label>
						<input matInput type="number" min="1" step="1" formControlName="amount" />
						@if (form.controls['amount'].invalid) { <mat-error>金額必須大於 0</mat-error> }
					</mat-form-field>

					<mat-form-field appearance="outline" class="col-12 col-md-6">
						<mat-label>分類</mat-label>
						<input matInput formControlName="category" [attr.list]="'activity-categories'" maxlength="30" />
						<datalist id="activity-categories">
							@for (category of categories; track category) { <option [value]="category"></option> }
						</datalist>
					</mat-form-field>
					<mat-form-field appearance="outline" class="col-12 col-md-6">
						<mat-label>狀態</mat-label>
						<mat-select formControlName="status">
							@for (status of statuses; track status) {
								<mat-option [value]="status">{{ statusLabels[status] }}</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<mat-form-field appearance="outline" class="col-12 col-md-6">
						<mat-label>下次扣款日</mat-label>
						<input matInput type="date" formControlName="nextBillingDate" />
					</mat-form-field>
					<mat-form-field appearance="outline" class="col-12 col-md-6">
						<mat-label>計費週期</mat-label>
						<mat-select formControlName="cycleKind">
							<mat-option value="monthly">每月</mat-option>
							<mat-option value="quarterly">每季</mat-option>
							<mat-option value="yearly">每年</mat-option>
							<mat-option value="custom">自訂週期</mat-option>
						</mat-select>
					</mat-form-field>

					@if (form.controls['cycleKind'].value === 'custom') {
						<mat-form-field appearance="outline" class="col-6">
							<mat-label>間隔</mat-label>
							<input matInput type="number" min="1" formControlName="interval" />
						</mat-form-field>
						<mat-form-field appearance="outline" class="col-6">
							<mat-label>單位</mat-label>
							<mat-select formControlName="unit">
								<mat-option value="day">天</mat-option>
								<mat-option value="month">月</mat-option>
								<mat-option value="year">年</mat-option>
							</mat-select>
						</mat-form-field>
					}

					<div class="col-12 reminder-row">
						<mat-slide-toggle formControlName="reminderEnabled">啟用扣款提醒</mat-slide-toggle>
						@if (form.controls['reminderEnabled'].value) {
							<mat-form-field appearance="outline" subscriptSizing="dynamic">
								<mat-label>提前天數</mat-label>
								<mat-select formControlName="reminderDays">
									@for (day of reminderOptions; track day) { <mat-option [value]="day">{{ day }} 天</mat-option> }
								</mat-select>
							</mat-form-field>
						}
					</div>

					<mat-form-field appearance="outline" class="col-12">
						<mat-label>網站連結（選填）</mat-label>
						<input matInput type="url" formControlName="website" />
					</mat-form-field>
					<mat-form-field appearance="outline" class="col-12">
						<mat-label>備註（選填）</mat-label>
						<textarea matInput rows="3" maxlength="500" formControlName="notes"></textarea>
					</mat-form-field>
				</div>
			</mat-dialog-content>
			<mat-dialog-actions align="end">
				<button mat-button type="button" mat-dialog-close>取消</button>
				<button mat-flat-button type="submit" [disabled]="form.invalid">儲存</button>
			</mat-dialog-actions>
		</form>
	`,
	styles: [`
		.form-content { width: min(720px, 78vw); padding-top: 8px !important; }
		.reminder-row { display: flex; align-items: center; gap: 24px; min-height: 64px; }
		@media (max-width: 599px) { .form-content { width: auto; } .reminder-row { align-items: flex-start; flex-direction: column; gap: 12px; } }
	`],
})
export class ActivityFormDialog {
	readonly categories = ACTIVITY_CATEGORIES;
	readonly statuses: ActivityStatus[] = ['active', 'paused', 'cancelled'];
	readonly statusLabels = ACTIVITY_STATUS_LABELS;
	readonly reminderOptions = [1, 3, 7, 14, 30];
	readonly form: FormGroup;

	constructor(
		@Inject(MAT_DIALOG_DATA) readonly data: ActivityFormData,
		private readonly dialogRef: MatDialogRef<ActivityFormDialog, ActivityDraft>,
	) {
		const item = data.item;
		const custom = item?.billingCycle.kind === 'custom' ? item.billingCycle : undefined;
		this.form = new FormGroup({
			name: new FormControl(item?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
			amount: new FormControl(item?.amount ?? 0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
			category: new FormControl(item?.category ?? '其他', { nonNullable: true, validators: [Validators.required] }),
			status: new FormControl<ActivityStatus>(item?.status ?? 'active', { nonNullable: true }),
			nextBillingDate: new FormControl(item?.nextBillingDate ?? '', { nonNullable: true, validators: [Validators.required] }),
			cycleKind: new FormControl<BillingCycle['kind']>(item?.billingCycle.kind ?? 'monthly', { nonNullable: true }),
			interval: new FormControl(custom?.interval ?? 1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
			unit: new FormControl<BillingUnit>(custom?.unit ?? 'month', { nonNullable: true }),
			reminderEnabled: new FormControl(item ? item.reminderDays !== null : true, { nonNullable: true }),
			reminderDays: new FormControl(item?.reminderDays ?? 3, { nonNullable: true }),
			website: new FormControl(item?.website ?? '', { nonNullable: true }),
			notes: new FormControl(item?.notes ?? '', { nonNullable: true, validators: [Validators.maxLength(500)] }),
		});
	}

	save(): void {
		if (this.form.invalid) return;
		const value = this.form.getRawValue();
		const billingCycle: BillingCycle = value.cycleKind === 'custom'
			? { kind: 'custom', interval: value.interval, unit: value.unit }
			: { kind: value.cycleKind };
		this.dialogRef.close({
			name: value.name.trim(), amount: Math.round(value.amount), category: value.category.trim(),
			status: value.status, nextBillingDate: value.nextBillingDate, billingCycle,
			reminderDays: value.reminderEnabled ? value.reminderDays : null,
			website: value.website.trim(), notes: value.notes.trim(),
		});
	}
}

@Component({
	selector: 'yo-activity-detail-dialog',
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
	template: `
		<div class="detail-heading">
			<div class="detail-icon"><mat-icon>receipt_long</mat-icon></div>
			<div><p class="eyebrow">{{ item.category }}</p><h2 mat-dialog-title>{{ item.name }}</h2></div>
		</div>
		<mat-dialog-content>
			<div class="detail-grid">
				<div><span>金額</span><strong>{{ item.amount | currency:'TWD':'symbol-narrow':'1.0-0':'zh-TW' }}</strong></div>
				<div><span>狀態</span><strong>{{ statusLabels[item.status] }}</strong></div>
				<div><span>下次扣款</span><strong>{{ item.nextBillingDate }}</strong></div>
				<div><span>週期</span><strong>{{ cycleLabel(item.billingCycle) }}</strong></div>
				<div><span>提醒</span><strong>{{ item.reminderDays === null ? '已關閉' : '提前 ' + item.reminderDays + ' 天' }}</strong></div>
			</div>
			@if (item.notes) { <div class="notes"><span>備註</span><p>{{ item.notes }}</p></div> }
			@if (item.website) { <a class="website" [href]="item.website" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon>開啟服務網站</a> }
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button mat-dialog-close>關閉</button>
			<button mat-flat-button [mat-dialog-close]="'edit'"><mat-icon>edit</mat-icon>編輯</button>
		</mat-dialog-actions>
	`,
	styles: [`
		.detail-heading { display:flex; align-items:center; gap:16px; padding:24px 24px 0; }
		.detail-heading h2 { padding:0; margin:0; }
		.detail-icon { width:48px; height:48px; border-radius:14px; display:grid; place-items:center; background:#e8f1ff; color:#1c5d99; }
		.eyebrow { margin:0 0 2px; color:#65758b; font-size:12px; font-weight:700; letter-spacing:.08em; }
		.detail-grid { min-width:360px; display:grid; grid-template-columns:1fr 1fr; gap:18px 32px; padding:12px 0; }
		.detail-grid div, .notes { display:flex; flex-direction:column; gap:4px; }
		.detail-grid span, .notes span { color:#718096; font-size:12px; }
		.notes { margin-top:12px; } .notes p { margin:0; white-space:pre-wrap; }
		.website { display:inline-flex; align-items:center; gap:6px; margin-top:18px; color:#1c5d99; text-decoration:none; }
		@media (max-width: 599px) { .detail-grid { min-width:0; grid-template-columns:1fr; } }
	`],
})
export class ActivityDetailDialog {
	readonly statusLabels = ACTIVITY_STATUS_LABELS;
	readonly cycleLabel = cycleLabel;
	constructor(@Inject(MAT_DIALOG_DATA) readonly item: Activity) {}
}

@Component({
	selector: 'yo-confirm-dialog',
	standalone: true,
	imports: [MatDialogModule, MatButtonModule],
	template: `
		<h2 mat-dialog-title>{{ data.title }}</h2>
		<mat-dialog-content>{{ data.message }}</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-button [mat-dialog-close]="false">取消</button>
			<button mat-flat-button color="warn" [mat-dialog-close]="true">{{ data.confirmText }}</button>
		</mat-dialog-actions>
	`,
})
export class ConfirmDialog {
	constructor(@Inject(MAT_DIALOG_DATA) readonly data: { title: string; message: string; confirmText: string }) {}
}
