import { Activity, BillingCycle, BillingEvent } from '../models/activity.model';

const DAY_MS = 86_400_000;

export function parseLocalDate(value: string): Date {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function formatLocalDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function startOfToday(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function addMonthsFromAnchor(anchor: Date, months: number): Date {
	const target = new Date(anchor.getFullYear(), anchor.getMonth() + months, 1);
	const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
	target.setDate(Math.min(anchor.getDate(), lastDay));
	return target;
}

export function cycleLabel(cycle: BillingCycle): string {
	switch (cycle.kind) {
		case 'monthly':
			return '每月';
		case 'quarterly':
			return '每季';
		case 'yearly':
			return '每年';
		case 'custom':
			return `每 ${cycle.interval} ${cycle.unit === 'day' ? '天' : cycle.unit === 'month' ? '個月' : '年'}`;
	}
}

export function monthlyEquivalent(activity: Activity): number {
	const { amount, billingCycle } = activity;
	switch (billingCycle.kind) {
		case 'monthly':
			return amount;
		case 'quarterly':
			return amount / 3;
		case 'yearly':
			return amount / 12;
		case 'custom': {
			const perYear =
				billingCycle.unit === 'day'
					? 365.2425 / billingCycle.interval
					: billingCycle.unit === 'month'
						? 12 / billingCycle.interval
						: 1 / billingCycle.interval;
			return (amount * perYear) / 12;
		}
	}
}

export function billingEventsBetween(
	activity: Activity,
	start: Date,
	end: Date,
): BillingEvent[] {
	if (activity.status !== 'active' || end < start) return [];

	const anchor = parseLocalDate(activity.nextBillingDate);
	if (anchor > end) return [];
	const events: BillingEvent[] = [];
	let index = 0;
	let occurrence = anchor;

	while (occurrence <= end && index < 5000) {
		if (occurrence >= start) {
			events.push({
				activityId: activity.id,
				activityName: activity.name,
				category: activity.category,
				amount: activity.amount,
				date: formatLocalDate(occurrence),
			});
		}
		index += 1;
		occurrence = occurrenceAt(anchor, activity.billingCycle, index);
	}

	return events;
}

function occurrenceAt(anchor: Date, cycle: BillingCycle, index: number): Date {
	switch (cycle.kind) {
		case 'monthly':
			return addMonthsFromAnchor(anchor, index);
		case 'quarterly':
			return addMonthsFromAnchor(anchor, index * 3);
		case 'yearly':
			return addMonthsFromAnchor(anchor, index * 12);
		case 'custom':
			return cycle.unit === 'day'
				? addDays(anchor, index * cycle.interval)
				: addMonthsFromAnchor(
						anchor,
						index * cycle.interval * (cycle.unit === 'year' ? 12 : 1),
					);
	}
}

export function daysBetween(start: Date, end: Date): number {
	return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}
