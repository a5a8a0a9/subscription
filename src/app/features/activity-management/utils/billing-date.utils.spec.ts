import { Activity } from '../models/activity.model';
import { billingEventsBetween, monthlyEquivalent, parseLocalDate } from './billing-date.utils';

function item(overrides: Partial<Activity> = {}): Activity {
	return {
		id: 'a1', name: 'Test', amount: 300, category: '軟體', status: 'active',
		startDate: '2026-01-01', nextBillingDate: '2026-01-31', billingCycle: { kind: 'monthly' }, reminderDays: 3,
		website: '', notes: '', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	};
}

describe('billing date utilities', () => {
	it('clamps monthly occurrences to the final day without drifting the anchor', () => {
		const events = billingEventsBetween(item(), parseLocalDate('2026-01-01'), parseLocalDate('2026-04-01'));
		expect(events.map((event) => event.date)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31']);
	});

	it('supports custom day intervals', () => {
		const events = billingEventsBetween(
			item({ nextBillingDate: '2026-02-01', billingCycle: { kind: 'custom', interval: 10, unit: 'day' } }),
			parseLocalDate('2026-02-01'), parseLocalDate('2026-03-01'),
		);
		expect(events.map((event) => event.date)).toEqual(['2026-02-01', '2026-02-11', '2026-02-21']);
	});

	it('excludes paused and cancelled items from generated events', () => {
		for (const status of ['paused', 'cancelled'] as const) {
			expect(billingEventsBetween(item({ status }), parseLocalDate('2026-01-01'), parseLocalDate('2026-12-31'))).toEqual([]);
		}
	});

	it('normalizes common cycles to a monthly amount', () => {
		expect(monthlyEquivalent(item({ amount: 3600, billingCycle: { kind: 'yearly' } }))).toBe(300);
		expect(monthlyEquivalent(item({ amount: 900, billingCycle: { kind: 'quarterly' } }))).toBe(300);
		expect(monthlyEquivalent(item({ amount: 300, billingCycle: { kind: 'monthly' } }))).toBe(300);
	});
});
