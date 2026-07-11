import { Injectable, computed, inject, signal } from '@angular/core';
import { Activity, ActivityDraft, BillingEvent } from '../models/activity.model';
import { ActivityRepository } from './activity.repository';
import { addDays, billingEventsBetween, monthlyEquivalent, startOfToday } from '../utils/billing-date.utils';

@Injectable({ providedIn: 'root' })
export class ActivityStore {
	private readonly repository = inject(ActivityRepository);
	private readonly itemsState = signal<Activity[]>(this.repository.load());
	readonly items = this.itemsState.asReadonly();
	readonly activeItems = computed(() => this.items().filter((item) => item.status === 'active'));
	readonly activeCount = computed(() => this.activeItems().length);
	readonly monthlySpend = computed(() =>
		this.activeItems().reduce((total, item) => total + monthlyEquivalent(item), 0),
	);
	readonly upcomingCharges = computed(() => {
		const today = startOfToday();
		return this.eventsBetween(today, addDays(today, 30));
	});
	readonly upcomingSpend = computed(() =>
		this.upcomingCharges().reduce((total, event) => total + event.amount, 0),
	);

	getById(id: string): Activity | undefined {
		return this.items().find((item) => item.id === id);
	}

	create(draft: ActivityDraft): Activity {
		const now = new Date().toISOString();
		const item: Activity = {
			...draft,
			id: globalThis.crypto?.randomUUID?.() ?? `activity-${Date.now()}`,
			createdAt: now,
			updatedAt: now,
		};
		this.commit([item, ...this.items()]);
		return item;
	}

	update(id: string, draft: ActivityDraft): void {
		this.commit(this.items().map((item) =>
			item.id === id ? { ...item, ...draft, updatedAt: new Date().toISOString() } : item,
		));
	}

	delete(id: string): void {
		this.commit(this.items().filter((item) => item.id !== id));
	}

	eventsBetween(start: Date, end: Date): BillingEvent[] {
		return this.items()
			.flatMap((item) => billingEventsBetween(item, start, end))
			.sort((a, b) => a.date.localeCompare(b.date) || a.activityName.localeCompare(b.activityName));
	}

	private commit(items: Activity[]): void {
		this.itemsState.set(items);
		this.repository.save(items);
	}
}
