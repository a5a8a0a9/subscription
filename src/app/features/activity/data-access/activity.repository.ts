import { Injectable } from '@angular/core';
import { Activity } from '../models/activity.model';
import { addDays, formatLocalDate, startOfToday } from '../utils/billing-date.utils';

interface StoredActivities {
	version: 2;
	items: Activity[];
}

interface LegacyStoredActivities {
	version: 1;
	items: Array<Omit<Activity, 'startDate'> & { startDate?: string }>;
}

@Injectable({ providedIn: 'root' })
export class ActivityRepository {
	private readonly storageKey = 'activity-manager.activities.v2';
	private readonly legacyStorageKey = 'activity-manager.activities.v1';

	load(): Activity[] {
		try {
			const currentRaw = localStorage.getItem(this.storageKey);
			if (currentRaw) {
				const parsed = JSON.parse(currentRaw) as StoredActivities;
				if (parsed.version !== 2 || !Array.isArray(parsed.items)) throw new Error('Unsupported data');
				return parsed.items.filter(isActivity);
			}

			const legacyRaw = localStorage.getItem(this.legacyStorageKey);
			if (legacyRaw) {
				const legacy = JSON.parse(legacyRaw) as LegacyStoredActivities;
				if (legacy.version !== 1 || !Array.isArray(legacy.items)) throw new Error('Unsupported legacy data');
				const migrated = legacy.items
					.map((item) => ({ ...item, startDate: item.startDate ?? item.nextBillingDate }))
					.filter(isActivity);
				this.save(migrated);
				return migrated;
			}

			const items = this.seedData();
			this.save(items);
			return items;
		} catch {
			const items = this.seedData();
			this.save(items);
			return items;
		}
	}

	save(items: Activity[]): void {
		const payload: StoredActivities = { version: 2, items };
		localStorage.setItem(this.storageKey, JSON.stringify(payload));
	}

	private seedData(): Activity[] {
		const now = new Date().toISOString();
		const today = startOfToday();
		return [
			{
				id: 'demo-video', name: 'Netflix', amount: 390, category: '影音', status: 'active',
				startDate: formatLocalDate(addDays(today, -90)),
				nextBillingDate: formatLocalDate(addDays(today, 3)), billingCycle: { kind: 'monthly' },
				reminderDays: 3, website: 'https://www.netflix.com', notes: '家庭影音方案', createdAt: now, updatedAt: now,
			},
			{
				id: 'demo-music', name: 'Spotify', amount: 149, category: '音樂', status: 'active',
				startDate: formatLocalDate(addDays(today, -180)),
				nextBillingDate: formatLocalDate(addDays(today, 12)), billingCycle: { kind: 'monthly' },
				reminderDays: 3, website: 'https://www.spotify.com', notes: '', createdAt: now, updatedAt: now,
			},
			{
				id: 'demo-cloud', name: 'Cloud Storage', amount: 900, category: '雲端', status: 'active',
				startDate: formatLocalDate(addDays(today, -365)),
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
		/^\d{4}-\d{2}-\d{2}$/.test(item.startDate ?? '') &&
		/^\d{4}-\d{2}-\d{2}$/.test(item.nextBillingDate ?? ''),
	);
}
