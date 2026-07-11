import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { ActivityStore } from '../../data-access/activity.store';
import { ReminderService } from '../../data-access/reminder.service';

@Component({
	selector: 'yo-dashboard',
	standalone: true,
	imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule],
	template: `
		<section class="page-heading">
			<div><p class="eyebrow">總覽</p><h1>晚上好，掌握每一筆定期支出</h1><p>讓即將扣款的服務都在你的掌握中。</p></div>
			<div class="heading-actions">
				<button mat-stroked-button (click)="enableNotifications()"><mat-icon>notifications</mat-icon>{{ notificationLabel() }}</button>
				<a mat-flat-button routerLink="/activities" [queryParams]="{create: 1}"><mat-icon>add</mat-icon>新增訂閱</a>
			</div>
		</section>

		<div class="row g-3 summary-grid">
			@for (card of summaryCards(); track card.label) {
				<div class="col-12 col-sm-6 col-xl-3">
					<mat-card class="summary-card">
						<mat-card-content>
							<div class="summary-icon" [class]="'summary-icon ' + card.tone"><mat-icon>{{ card.icon }}</mat-icon></div>
							<div><span>{{ card.label }}</span><strong>{{ card.value }}</strong><small>{{ card.hint }}</small></div>
						</mat-card-content>
					</mat-card>
				</div>
			}
		</div>

		<div class="row g-4 dashboard-body">
			<div class="col-12 col-lg-8">
				<mat-card class="panel-card">
					<mat-card-header><div><mat-card-title>即將扣款</mat-card-title><mat-card-subtitle>未來 30 天的支出行程</mat-card-subtitle></div><a mat-button routerLink="/calendar">查看月曆</a></mat-card-header>
					<mat-card-content>
						@if (store.upcomingCharges().length) {
							<div class="charge-list">
								@for (event of store.upcomingCharges().slice(0, 6); track event.activityId + event.date) {
									<div class="charge-row">
										<div class="date-chip"><strong>{{ event.date | date:'dd':'':'zh-TW' }}</strong><span>{{ event.date | date:'MMM':'':'zh-TW' }}</span></div>
										<div class="charge-name"><strong>{{ event.activityName }}</strong><span>{{ event.category }}</span></div>
										<strong>{{ event.amount | currency:'TWD':'symbol-narrow':'1.0-0':'zh-TW' }}</strong>
									</div>
								}
							</div>
						} @else { <div class="empty-state"><mat-icon>event_available</mat-icon><p>未來 30 天沒有預計扣款</p></div> }
					</mat-card-content>
				</mat-card>
			</div>
			<div class="col-12 col-lg-4">
				<mat-card class="panel-card reminder-card">
					<mat-card-header><mat-card-title>近期提醒</mat-card-title><mat-card-subtitle>根據每筆項目的提醒設定</mat-card-subtitle></mat-card-header>
					<mat-card-content>
						@if (dueSoon().length) {
							@for (event of dueSoon(); track event.activityId + event.date) {
								<div class="reminder-item"><mat-icon>schedule</mat-icon><div><strong>{{ event.activityName }}</strong><span>{{ event.date }} 扣款</span></div></div>
							}
						} @else { <div class="empty-state compact"><mat-icon>notifications_none</mat-icon><p>目前沒有近期提醒</p></div> }
					</mat-card-content>
				</mat-card>
			</div>
		</div>
	`,
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
	readonly store = inject(ActivityStore);
	private readonly reminders = inject(ReminderService);
	private readonly snackBar = inject(MatSnackBar);
	readonly permission = signal(this.reminders.permission());
	readonly dueSoon = computed(() => this.reminders.dueSoon().slice(0, 5));
	readonly notificationLabel = computed(() => ({
		granted: '通知已啟用', denied: '通知已被拒絕', default: '啟用扣款通知', unsupported: '瀏覽器不支援通知',
	})[this.permission()]);
	readonly summaryCards = computed(() => [
		{ label: '啟用中訂閱', value: `${this.store.activeCount()} 項`, hint: '已排除暫停與取消', icon: 'receipt_long', tone: 'blue' },
		{ label: '估計月均支出', value: currency(this.store.monthlySpend()), hint: '依各週期年化換算', icon: 'account_balance_wallet', tone: 'violet' },
		{ label: '未來 30 天', value: currency(this.store.upcomingSpend()), hint: `${this.store.upcomingCharges().length} 筆預計扣款`, icon: 'calendar_month', tone: 'amber' },
		{ label: '需要留意', value: `${this.dueSoon().length} 項`, hint: '進入各項目提醒期', icon: 'notifications_active', tone: 'green' },
	]);

	async enableNotifications(): Promise<void> {
		if (this.permission() === 'granted' || this.permission() === 'unsupported') return;
		const result = await this.reminders.requestPermission();
		this.permission.set(result);
		this.snackBar.open(result === 'granted' ? '扣款通知已啟用' : '無法啟用通知，站內提醒仍會保留', '知道了', { duration: 3500 });
	}
}

function currency(value: number): string {
	return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value);
}
