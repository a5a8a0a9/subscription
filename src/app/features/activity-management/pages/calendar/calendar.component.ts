import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
	ActivityDetailDialog,
	ActivityFormDialog,
} from '../activities/activity-dialogs';
import { Activity } from '../../models/activity.model';
import { ActivityStore } from '../../data-access/activity.store';
import { formatLocalDate } from '../../utils/billing-date.utils';

interface CalendarDay {
	date: Date;
	dateKey: string;
	dayNumber: number;
	inMonth: boolean;
	isToday: boolean;
	events: ReturnType<ActivityStore['eventsBetween']>;
}

@Component({
	selector: 'yo-calendar',
	standalone: true,
	imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
	template: `
		<section class="page-heading">
			<div>
				<p class="eyebrow">扣款行程</p>
				<h1>訂閱月曆</h1>
				<p>以月份查看預計扣款日與金額。</p>
			</div>
			<div class="month-nav">
				<button mat-icon-button (click)="moveMonth(-1)" aria-label="上一個月">
					<mat-icon>chevron_left</mat-icon>
				</button>
				<button mat-button (click)="goToday()">今天</button>
				<button mat-icon-button (click)="moveMonth(1)" aria-label="下一個月">
					<mat-icon>chevron_right</mat-icon>
				</button>
			</div>
		</section>

		<mat-card class="calendar-card">
			<mat-card-header>
				<mat-card-title>{{
					visibleMonth() | date: 'yyyy 年 M 月' : '' : 'zh-TW'
				}}</mat-card-title>
				<div class="month-total">
					本月預計
					<strong>{{
						monthTotal() | currency: 'TWD' : 'symbol-narrow' : '1.0-0' : 'zh-TW'
					}}</strong>
				</div>
			</mat-card-header>
			<mat-card-content>
				<div class="weekday-grid">
					@for (day of weekdays; track day) {
						<div>{{ day }}</div>
					}
				</div>
				<div class="calendar-grid">
					@for (day of days(); track day.dateKey) {
						<div
							class="calendar-day"
							[class.outside]="!day.inMonth"
							[class.today]="day.isToday"
						>
							<div class="day-number">{{ day.dayNumber }}</div>
							<div class="event-list">
								@for (
									event of day.events;
									track event.activityId + event.date
								) {
									<button
										class="billing-event"
										(click)="openEvent(event.activityId)"
										[title]="event.activityName + ' NT$' + event.amount"
									>
										<span>{{ event.activityName }}</span
										><strong>{{
											event.amount | number: '1.0-0' : 'zh-TW'
										}}</strong>
									</button>
								}
							</div>
						</div>
					}
				</div>
			</mat-card-content>
		</mat-card>
	`,
	styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
	private readonly store = inject(ActivityStore);
	private readonly dialog = inject(MatDialog);
	readonly weekdays = ['日', '一', '二', '三', '四', '五', '六'];
	readonly visibleMonth = signal(firstOfMonth(new Date()));
	readonly monthEvents = computed(() => {
		const start = this.visibleMonth();
		const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
		return this.store.eventsBetween(start, end);
	});
	readonly monthTotal = computed(() =>
		this.monthEvents().reduce((total, event) => total + event.amount, 0),
	);
	readonly days = computed<CalendarDay[]>(() => {
		const month = this.visibleMonth();
		const gridStart = new Date(month);
		gridStart.setDate(1 - month.getDay());
		const todayKey = formatLocalDate(new Date());
		return Array.from({ length: 42 }, (_, index) => {
			const date = new Date(gridStart);
			date.setDate(gridStart.getDate() + index);
			const dateKey = formatLocalDate(date);
			return {
				date,
				dateKey,
				dayNumber: date.getDate(),
				inMonth: date.getMonth() === month.getMonth(),
				isToday: dateKey === todayKey,
				events: this.store.eventsBetween(date, date),
			};
		});
	});

	moveMonth(offset: number): void {
		const current = this.visibleMonth();
		this.visibleMonth.set(
			new Date(current.getFullYear(), current.getMonth() + offset, 1),
		);
	}

	goToday(): void {
		this.visibleMonth.set(firstOfMonth(new Date()));
	}

	openEvent(id: string): void {
		const item = this.store.getById(id);
		if (!item) return;
		this.dialog
			.open(ActivityDetailDialog, { data: item, maxWidth: '92vw' })
			.afterClosed()
			.subscribe((action) => {
				if (action === 'edit') this.openForm(item);
			});
	}

	private openForm(item: Activity): void {
		this.dialog
			.open(ActivityFormDialog, { data: { item }, maxWidth: '95vw' })
			.afterClosed()
			.subscribe((draft) => {
				if (draft) this.store.update(item.id, draft);
			});
	}
}

function firstOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}
