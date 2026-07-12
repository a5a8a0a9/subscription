import { DestroyRef, Injectable, inject } from '@angular/core';
import { ActivityStore } from './activity.store';
import {
	addDays,
	billingEventsBetween,
	formatLocalDate,
	startOfToday,
} from '../utils/billing-date.utils';

@Injectable({ providedIn: 'root' })
export class ReminderService {
	private readonly store = inject(ActivityStore);
	private readonly destroyRef = inject(DestroyRef);
	private readonly sentKey = 'sub-track.reminders.v1';
	private initialized = false;

	initialize(): void {
		if (this.initialized || typeof window === 'undefined') return;
		this.initialized = true;
		const check = () => this.checkAndNotify();
		window.addEventListener('focus', check);
		window.addEventListener('online', check);
		this.destroyRef.onDestroy(() => {
			window.removeEventListener('focus', check);
			window.removeEventListener('online', check);
		});
		this.checkAndNotify();
	}

	async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
		if (!('Notification' in globalThis)) return 'unsupported';
		const permission = await Notification.requestPermission();
		if (permission === 'granted') this.checkAndNotify();
		return permission;
	}

	permission(): NotificationPermission | 'unsupported' {
		return 'Notification' in globalThis
			? Notification.permission
			: 'unsupported';
	}

	dueSoon() {
		const today = startOfToday();
		return this.store.activeItems().flatMap((item) => {
			if (item.reminderDays === null) return [];
			return billingEventsBetween(
				item,
				today,
				addDays(today, item.reminderDays),
			);
		});
	}

	private checkAndNotify(): void {
		if (this.permission() !== 'granted') return;
		const today = startOfToday();
		const todayKey = formatLocalDate(today);
		const sent = this.readSent();
		for (const item of this.store.activeItems()) {
			if (item.reminderDays === null) continue;
			for (const event of billingEventsBetween(
				item,
				today,
				addDays(today, item.reminderDays),
			)) {
				const key = `${item.id}|${event.date}|${todayKey}`;
				if (sent.has(key)) continue;
				new Notification('訂閱即將扣款', {
					body: `${item.name} 將於 ${event.date} 扣款 NT$${item.amount.toLocaleString('zh-TW')}`,
					icon: 'assets/icons/icon-192x192.png',
				});
				sent.add(key);
			}
		}
		localStorage.setItem(this.sentKey, JSON.stringify([...sent].slice(-200)));
	}

	private readSent(): Set<string> {
		try {
			const value = JSON.parse(
				localStorage.getItem(this.sentKey) ?? '[]',
			) as unknown;
			return new Set(
				Array.isArray(value)
					? value.filter((item): item is string => typeof item === 'string')
					: [],
			);
		} catch {
			return new Set();
		}
	}
}
