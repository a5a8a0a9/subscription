import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{
		path: 'dashboard',
		loadComponent: () =>
			import('./features/activity/pages/dashboard/dashboard.component').then(
				(module) => module.DashboardComponent,
			),
		title: '總覽 | SubTrack',
	},
	{
		path: 'activities',
		loadComponent: () =>
			import('./features/activity/pages/activities/activity-list.component').then(
				(module) => module.ActivityListComponent,
			),
		title: '我的訂閱 | SubTrack',
	},
	{
		path: 'calendar',
		loadComponent: () =>
			import('./features/activity/pages/calendar/calendar.component').then(
				(module) => module.CalendarComponent,
			),
		title: '訂閱月曆 | SubTrack',
	},
	{ path: '**', redirectTo: 'dashboard' },
];
