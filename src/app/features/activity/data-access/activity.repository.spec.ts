import { TestBed } from '@angular/core/testing';
import { ActivityRepository } from './activity.repository';

describe('ActivityRepository', () => {
	let repository: ActivityRepository;

	beforeEach(() => {
		localStorage.clear();
		repository = TestBed.inject(ActivityRepository);
	});

	afterEach(() => localStorage.clear());

	it('starts with an empty collection when storage is empty', () => {
		const items = repository.load();
		expect(items).toEqual([]);
		expect(repository.load()).toEqual(items);
	});

	it('recovers safely from corrupt data', () => {
		localStorage.setItem('sub-track.activities.v1', '{not-json');
		expect(() => repository.load()).not.toThrow();
		expect(repository.load()).toEqual([]);
	});
});
