import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';

@Component({
	selector: 'yo-root',
	imports: [RouterOutlet, ButtonDirective, DatePicker],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	date = null;
	protected readonly title = signal('subscription');
}
