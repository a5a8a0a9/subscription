import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
	selector: 'yo-root',
	imports: [RouterOutlet, ButtonModule, DatePickerModule, FormsModule],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	date = null;
	protected readonly title = signal('subscription');
}
