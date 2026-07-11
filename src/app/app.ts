import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ReminderService } from './features/activity-management/data-access/reminder.service';

@Component({
	selector: 'yo-root',
	imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatIconModule],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	private readonly reminderService = inject(ReminderService);

	constructor() {
		this.reminderService.initialize();
	}
}
