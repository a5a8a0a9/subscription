import { Injectable } from '@angular/core';
import { Activity } from '../models/activity.model';

interface StoredActivities {
	version: 1;
	items: Activity[];
}

@Injectable({ providedIn: 'root' })
export class ActivityRepository {
	private readonly storageKey = 'sub-track.activities.v1';

	load(): Activity[] {
		try {
			const currentRaw = localStorage.getItem(this.storageKey);
			if (currentRaw) {
				const parsed = JSON.parse(currentRaw) as StoredActivities;
				if (parsed.version !== 1 || !Array.isArray(parsed.items))
					throw new Error('Unsupported data');
				return parsed.items.filter(isActivity);
			}

			const items: Activity[] = [];
			this.save(items);
			return items;
		} catch {
			const items: Activity[] = [];
			this.save(items);
			return items;
		}
	}

	save(items: Activity[]): void {
		const payload: StoredActivities = { version: 1, items };
		localStorage.setItem(this.storageKey, JSON.stringify(payload));
	}
}

function isActivity(value: unknown): value is Activity {
	if (!value || typeof value !== 'object') return false;
	const item = value as Partial<Activity>;
	return Boolean(
		item.id &&
		item.name &&
		typeof item.amount === 'number' &&
		item.billingCycle &&
		/^\d{4}-\d{2}-\d{2}$/.test(item.startDate ?? '') &&
		/^\d{4}-\d{2}-\d{2}$/.test(item.nextBillingDate ?? ''),
	);
}
