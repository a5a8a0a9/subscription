import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ACTIVITY_CATEGORIES, ACTIVITY_STATUS_LABELS, Activity, ActivityStatus } from '../../models/activity.model';
import { ActivityStore } from '../../data-access/activity.store';
import { cycleLabel } from '../../utils/billing-date.utils';
import {
	ActivityDetailDialogComponent,
	ActivityFormDialogComponent,
	ConfirmDialogComponent,
} from './activity-dialogs';

type SortOption = 'date' | 'name' | 'amountHigh' | 'amountLow';

@Component({
	selector: 'yo-activity-list',
	standalone: true,
	imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
	templateUrl: './activity-list.component.html',
	styleUrl: './activity-list.component.scss',
})
export class ActivityListComponent {
	private readonly store = inject(ActivityStore);
	private readonly dialog = inject(MatDialog);
	private readonly route = inject(ActivatedRoute);
	readonly search = signal('');
	readonly status = signal<ActivityStatus | 'all'>('all');
	readonly category = signal('all');
	readonly sort = signal<SortOption>('date');
	readonly statuses: ActivityStatus[] = ['active', 'paused', 'cancelled'];
	readonly statusLabels = ACTIVITY_STATUS_LABELS;
	readonly cycleLabel = cycleLabel;
	readonly categories = computed(() => [...new Set([...ACTIVITY_CATEGORIES, ...this.store.items().map((item) => item.category)])].sort());
	readonly filteredItems = computed(() => {
		const term = this.search().trim().toLocaleLowerCase('zh-TW');
		const result = this.store.items().filter((item) =>
			(!term || `${item.name} ${item.category}`.toLocaleLowerCase('zh-TW').includes(term)) &&
			(this.status() === 'all' || item.status === this.status()) &&
			(this.category() === 'all' || item.category === this.category()),
		);
		return [...result].sort((a, b) => {
			switch (this.sort()) {
				case 'name': return a.name.localeCompare(b.name, 'zh-TW');
				case 'amountHigh': return b.amount - a.amount;
				case 'amountLow': return a.amount - b.amount;
				default: return a.nextBillingDate.localeCompare(b.nextBillingDate);
			}
		});
	});

	constructor() {
		this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
			if (params.has('create')) queueMicrotask(() => this.openForm());
		});
	}

	openForm(item?: Activity): void {
		this.dialog.open(ActivityFormDialogComponent, { data: { item }, maxWidth: '95vw', autoFocus: 'first-tabbable' })
			.afterClosed().subscribe((draft) => {
				if (!draft) return;
				item ? this.store.update(item.id, draft) : this.store.create(draft);
			});
	}

	openDetail(item: Activity): void {
		this.dialog.open(ActivityDetailDialogComponent, { data: item, maxWidth: '92vw' }).afterClosed().subscribe((action) => {
			if (action === 'edit') this.openForm(item);
		});
	}

	confirmDelete(item: Activity): void {
		this.dialog.open(ConfirmDialogComponent, { data: { title: '刪除訂閱？', message: `「${item.name}」將被永久刪除，此動作無法復原。`, confirmText: '永久刪除' } })
			.afterClosed().subscribe((confirmed) => { if (confirmed) this.store.delete(item.id); });
	}
}
