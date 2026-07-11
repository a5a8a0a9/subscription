import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{
		path: 'dashboard',
		loadComponent: () => import('./dashboard/dashboard.component').then((module) => module.DashboardComponent),
		title: '總覽 | SubTrack',
	},
	{
		path: 'activities',
		loadComponent: () => import('./activities/activity-list.component').then((module) => module.ActivityListComponent),
		title: '我的訂閱 | SubTrack',
	},
	{
		path: 'calendar',
		loadComponent: () => import('./calendar/calendar.component').then((module) => module.CalendarComponent),
		title: '訂閱月曆 | SubTrack',
	},
	{ path: '**', redirectTo: 'dashboard' },
];
