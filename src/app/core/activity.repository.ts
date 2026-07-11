import { Injectable } from '@angular/core';
import { Activity } from './activity.model';
import { addDays, formatLocalDate, startOfToday } from './billing-date.utils';

interface StoredActivities {
	version: 1;
	items: Activity[];
}

@Injectable({ providedIn: 'root' })
export class ActivityRepository {
	private readonly storageKey = 'activity-manager.activities.v1';

	load(): Activity[] {
		try {
			const raw = localStorage.getItem(this.storageKey);
			if (!raw) {
				const items = this.seedData();
				this.save(items);
				return items;
			}
			const parsed = JSON.parse(raw) as StoredActivities;
			if (parsed.version !== 1 || !Array.isArray(parsed.items)) throw new Error('Unsupported data');
			return parsed.items.filter(isActivity);
		} catch {
			const items = this.seedData();
			this.save(items);
			return items;
		}
	}

	save(items: Activity[]): void {
		const payload: StoredActivities = { version: 1, items };
		localStorage.setItem(this.storageKey, JSON.stringify(payload));
	}

	private seedData(): Activity[] {
		const now = new Date().toISOString();
		const today = startOfToday();
		return [
			{
				id: 'demo-video', name: 'Netflix', amount: 390, category: '影音', status: 'active',
				nextBillingDate: formatLocalDate(addDays(today, 3)), billingCycle: { kind: 'monthly' },
				reminderDays: 3, website: 'https://www.netflix.com', notes: '家庭影音方案', createdAt: now, updatedAt: now,
			},
			{
				id: 'demo-music', name: 'Spotify', amount: 149, category: '音樂', status: 'active',
				nextBillingDate: formatLocalDate(addDays(today, 12)), billingCycle: { kind: 'monthly' },
				reminderDays: 3, website: 'https://www.spotify.com', notes: '', createdAt: now, updatedAt: now,
			},
			{
				id: 'demo-cloud', name: 'Cloud Storage', amount: 900, category: '雲端', status: 'active',
				nextBillingDate: formatLocalDate(addDays(today, 24)), billingCycle: { kind: 'yearly' },
				reminderDays: 7, website: '', notes: '年度備份方案', createdAt: now, updatedAt: now,
			},
		];
	}
}

function isActivity(value: unknown): value is Activity {
	if (!value || typeof value !== 'object') return false;
	const item = value as Partial<Activity>;
	return Boolean(
		item.id && item.name && typeof item.amount === 'number' && item.billingCycle &&
		/^\d{4}-\d{2}-\d{2}$/.test(item.nextBillingDate ?? ''),
	);
}

