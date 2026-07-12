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
});
