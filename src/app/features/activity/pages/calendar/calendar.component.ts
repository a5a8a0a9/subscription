import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PageContainerComponent } from '@layout/page-container/page-container.component';
import { ActivityDetailDialogComponent } from '../../components/activity-detail-dialog/activity-detail-dialog.component';
import { ActivityFormDialogComponent } from '../../components/activity-form-dialog/activity-form-dialog.component';
import { ActivityStore } from '../../data-access/activity.store';
import { Activity } from '../../models/activity.model';
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
	host: { class: 'd-block' },
	imports: [
		CommonModule,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		PageContainerComponent,
	],
	templateUrl: './calendar.component.html',
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
			.open(ActivityDetailDialogComponent, { data: item, maxWidth: '92vw' })
			.afterClosed()
			.subscribe((action) => {
				if (action === 'edit') this.openForm(item);
			});
	}

	private openForm(item: Activity): void {
		this.dialog
			.open(ActivityFormDialogComponent, { data: { item }, maxWidth: '95vw' })
			.afterClosed()
			.subscribe((draft) => {
				if (draft) this.store.update(item.id, draft);
			});
	}
}

function firstOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}
