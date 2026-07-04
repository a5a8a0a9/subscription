import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'yo-root',
	imports: [RouterOutlet],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	date = null;
	protected readonly title = signal('subscription');
}
