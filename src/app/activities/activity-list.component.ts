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
import { ACTIVITY_CATEGORIES, ACTIVITY_STATUS_LABELS, Activity, ActivityStatus } from '../core/activity.model';
import { ActivityStore } from '../core/activity.store';
import { cycleLabel } from '../core/billing-date.utils';
import { ActivityDetailDialog, ActivityFormDialog, ConfirmDialog } from './activity-dialogs';

type SortOption = 'date' | 'name' | 'amountHigh' | 'amountLow';

@Component({
	selector: 'yo-activity-list',
	standalone: true,
	imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
	template: `
		<section class="page-heading">
			<div><p class="eyebrow">訂閱管理</p><h1>我的訂閱</h1><p>查看並管理所有定期支出。</p></div>
			<button mat-flat-button (click)="openForm()"><mat-icon>add</mat-icon>新增訂閱</button>
		</section>

		<mat-card class="filter-card">
			<mat-card-content>
				<mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
					<mat-label>搜尋名稱或分類</mat-label><mat-icon matPrefix>search</mat-icon>
					<input matInput [value]="search()" (input)="search.set($any($event.target).value)" />
				</mat-form-field>
				<mat-form-field appearance="outline" subscriptSizing="dynamic">
					<mat-label>狀態</mat-label><mat-select [value]="status()" (selectionChange)="status.set($event.value)">
						<mat-option value="all">全部狀態</mat-option>
						@for (item of statuses; track item) { <mat-option [value]="item">{{ statusLabels[item] }}</mat-option> }
					</mat-select>
				</mat-form-field>
				<mat-form-field appearance="outline" subscriptSizing="dynamic">
					<mat-label>分類</mat-label><mat-select [value]="category()" (selectionChange)="category.set($event.value)">
						<mat-option value="all">全部分類</mat-option>
						@for (item of categories(); track item) { <mat-option [value]="item">{{ item }}</mat-option> }
					</mat-select>
				</mat-form-field>
				<mat-form-field appearance="outline" subscriptSizing="dynamic">
					<mat-label>排序</mat-label><mat-select [value]="sort()" (selectionChange)="sort.set($event.value)">
						<mat-option value="date">扣款日</mat-option><mat-option value="name">名稱</mat-option>
						<mat-option value="amountHigh">金額：高至低</mat-option><mat-option value="amountLow">金額：低至高</mat-option>
					</mat-select>
				</mat-form-field>
			</mat-card-content>
		</mat-card>

		<div class="result-meta">共 {{ filteredItems().length }} 項結果</div>
		@if (filteredItems().length) {
			<div class="activity-grid">
				@for (item of filteredItems(); track item.id) {
					<mat-card class="activity-card" (click)="openDetail(item)">
						<mat-card-content>
							<div class="card-top"><div class="service-icon">{{ item.name.charAt(0).toUpperCase() }}</div><span class="status-pill" [class]="'status-pill ' + item.status">{{ statusLabels[item.status] }}</span></div>
							<h2>{{ item.name }}</h2><span class="category">{{ item.category }}</span>
							<div class="amount">{{ item.amount | currency:'TWD':'symbol-narrow':'1.0-0':'zh-TW' }} <small>/ {{ cycleLabel(item.billingCycle) }}</small></div>
							<div class="billing-date"><mat-icon>event</mat-icon><span>下次扣款 {{ item.nextBillingDate }}</span></div>
							<div class="card-actions">
								<button mat-button (click)="openForm(item); $event.stopPropagation()"><mat-icon>edit</mat-icon>編輯</button>
								<button mat-icon-button aria-label="刪除" (click)="confirmDelete(item); $event.stopPropagation()"><mat-icon>delete_outline</mat-icon></button>
							</div>
						</mat-card-content>
					</mat-card>
				}
			</div>
		} @else {
			<div class="empty-state"><mat-icon>search_off</mat-icon><h2>找不到符合的訂閱</h2><p>請調整搜尋或篩選條件。</p></div>
		}
	`,
	styleUrl: './activity-list.component.scss',
})
export class ActivityListComponent {
	private readonly store = inject(ActivityStore);
	private readonly dialog = inject(MatDialog);
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

	constructor(route: ActivatedRoute) {
		route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
			if (params.has('create')) queueMicrotask(() => this.openForm());
		});
	}

	openForm(item?: Activity): void {
		this.dialog.open(ActivityFormDialog, { data: { item }, maxWidth: '95vw', autoFocus: 'first-tabbable' })
			.afterClosed().subscribe((draft) => {
				if (!draft) return;
				item ? this.store.update(item.id, draft) : this.store.create(draft);
			});
	}

	openDetail(item: Activity): void {
		this.dialog.open(ActivityDetailDialog, { data: item, maxWidth: '92vw' }).afterClosed().subscribe((action) => {
			if (action === 'edit') this.openForm(item);
		});
	}

	confirmDelete(item: Activity): void {
		this.dialog.open(ConfirmDialog, { data: { title: '刪除訂閱？', message: `「${item.name}」將被永久刪除，此動作無法復原。`, confirmText: '永久刪除' } })
			.afterClosed().subscribe((confirmed) => { if (confirmed) this.store.delete(item.id); });
	}
}

