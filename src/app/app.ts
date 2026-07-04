import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'yo-root',
	imports: [RouterOutlet, MatButtonModule, MatDividerModule, MatIconModule],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	date = null;
	protected readonly title = signal('subscription');
}
