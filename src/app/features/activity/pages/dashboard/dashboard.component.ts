import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { PageContainerComponent } from '@layout/page-container/page-container.component';
import { ActivityStore } from '../../data-access/activity.store';
import { ReminderService } from '../../data-access/reminder.service';

@Component({
	selector: 'yo-dashboard',
	standalone: true,
	host: { class: 'd-block' },
	imports: [
		CommonModule,
		RouterLink,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		MatSnackBarModule,
		PageContainerComponent,
	],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
	readonly store = inject(ActivityStore);
	private readonly reminders = inject(ReminderService);
	private readonly snackBar = inject(MatSnackBar);
	readonly permission = signal(this.reminders.permission());
	readonly dueSoon = computed(() => this.reminders.dueSoon().slice(0, 5));
	readonly notificationLabel = computed(
		() =>
			({
				granted: '通知已啟用',
				denied: '通知已被拒絕',
				default: '啟用扣款通知',
				unsupported: '瀏覽器不支援通知',
			})[this.permission()],
	);
	readonly summaryCards = computed(() => [
		{
			label: '啟用中訂閱',
			value: `${this.store.activeCount()} 項`,
			hint: '已排除暫停與取消',
			icon: 'receipt_long',
			tone: 'blue',
		},
		{
			label: '估計月均支出',
			value: currency(this.store.monthlySpend()),
			hint: '依各週期年化換算',
			icon: 'account_balance_wallet',
			tone: 'violet',
		},
		{
			label: '未來 30 天',
			value: currency(this.store.upcomingSpend()),
			hint: `${this.store.upcomingCharges().length} 筆預計扣款`,
			icon: 'calendar_month',
			tone: 'amber',
		},
		{
			label: '需要留意',
			value: `${this.dueSoon().length} 項`,
			hint: '進入各項目提醒期',
			icon: 'notifications_active',
			tone: 'green',
		},
	]);

	async enableNotifications(): Promise<void> {
		if (this.permission() === 'granted' || this.permission() === 'unsupported')
			return;
		const result = await this.reminders.requestPermission();
		this.permission.set(result);
		this.snackBar.open(
			result === 'granted'
				? '扣款通知已啟用'
				: '無法啟用通知，站內提醒仍會保留',
			'知道了',
			{ duration: 3500 },
		);
	}
}

function currency(value: number): string {
	return new Intl.NumberFormat('zh-TW', {
		style: 'currency',
		currency: 'TWD',
		maximumFractionDigits: 0,
	}).format(value);
}
