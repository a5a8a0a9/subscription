import { TestBed } from '@angular/core/testing';
import { ActivityRepository } from './activity.repository';

describe('ActivityRepository', () => {
	let repository: ActivityRepository;

	beforeEach(() => {
		localStorage.clear();
		repository = TestBed.inject(ActivityRepository);
	});

	afterEach(() => localStorage.clear());

	it('creates starter data when storage is empty', () => {
		const items = repository.load();
		expect(items.length).toBeGreaterThan(0);
		expect(repository.load()).toEqual(items);
	});

	it('recovers safely from corrupt data', () => {
		localStorage.setItem('activity-manager.activities.v2', '{not-json');
		expect(() => repository.load()).not.toThrow();
		expect(repository.load().length).toBeGreaterThan(0);
	});

	it('migrates v1 data by using the next billing date as the start date', () => {
		localStorage.setItem(
			'activity-manager.activities.v1',
			JSON.stringify({
				version: 1,
				items: [
					{
						id: 'legacy',
						name: 'Legacy',
						amount: 100,
						category: '其他',
						status: 'active',
						nextBillingDate: '2026-09-01',
						billingCycle: { kind: 'monthly' },
						reminderDays: 3,
						website: '',
						notes: '',
						createdAt: '2026-01-01T00:00:00.000Z',
						updatedAt: '2026-01-01T00:00:00.000Z',
					},
				],
			}),
		);

		const [migrated] = repository.load();
		expect(migrated.startDate).toBe('2026-09-01');
		expect(
			JSON.parse(localStorage.getItem('activity-manager.activities.v2') ?? '{}')
				.version,
		).toBe(2);
	});
});
