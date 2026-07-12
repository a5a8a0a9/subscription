import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReminderService } from './features/activity/data-access/reminder.service';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';

@Component({
	selector: 'yo-root',
	imports: [RouterOutlet, HeaderComponent, FooterComponent],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	private readonly reminderService = inject(ReminderService);

	constructor() {
		this.reminderService.initialize();
	}
}
