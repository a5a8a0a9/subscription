import { TestBed } from '@angular/core/testing';
import { ActivityDraft } from '../models/activity.model';
import { ActivityStore } from './activity.store';

const draft: ActivityDraft = {
	name: 'Design Tool', amount: 600, category: '軟體', status: 'active',
	startDate: '2026-07-01', nextBillingDate: '2026-08-01', billingCycle: { kind: 'monthly' }, reminderDays: 3,
	website: '', notes: '',
};

describe('ActivityStore', () => {
	let store: ActivityStore;

	beforeEach(() => {
		localStorage.clear();
		TestBed.resetTestingModule();
		store = TestBed.inject(ActivityStore);
	});

	afterEach(() => localStorage.clear());

	it('creates, updates and permanently deletes an item', () => {
		const created = store.create(draft);
		expect(store.getById(created.id)?.name).toBe('Design Tool');

		store.update(created.id, { ...draft, name: 'Updated Tool', amount: 750 });
		expect(store.getById(created.id)?.name).toBe('Updated Tool');
		expect(store.getById(created.id)?.amount).toBe(750);

		store.delete(created.id);
		expect(store.getById(created.id)).toBeUndefined();
	});

	it('excludes inactive items from derived spending totals', () => {
		const active = store.create(draft);
		const withActive = store.monthlySpend();
		store.update(active.id, { ...draft, status: 'paused' });
		expect(store.monthlySpend()).toBe(withActive - draft.amount);
	});
});
