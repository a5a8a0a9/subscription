export type ActivityStatus = 'active' | 'paused' | 'cancelled';

export type BillingUnit = 'day' | 'month' | 'year';

export type BillingCycle =
	| { kind: 'monthly' }
	| { kind: 'quarterly' }
	| { kind: 'yearly' }
	| { kind: 'custom'; interval: number; unit: BillingUnit };

export interface Activity {
	id: string;
	name: string;
	amount: number;
	category: string;
	status: ActivityStatus;
	nextBillingDate: string;
	billingCycle: BillingCycle;
	reminderDays: number | null;
	website: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface ActivityDraft {
	name: string;
	amount: number;
	category: string;
	status: ActivityStatus;
	nextBillingDate: string;
	billingCycle: BillingCycle;
	reminderDays: number | null;
	website: string;
	notes: string;
}

export interface BillingEvent {
	activityId: string;
	activityName: string;
	category: string;
	amount: number;
	date: string;
}

export interface ReminderRecord {
	activityId: string;
	billingDate: string;
	triggerDate: string;
}

export const ACTIVITY_CATEGORIES = [
	'影音',
	'音樂',
	'軟體',
	'雲端',
	'學習',
	'健康',
	'其他',
] as const;

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
	active: '啟用',
	paused: '暫停',
	cancelled: '已取消',
};

