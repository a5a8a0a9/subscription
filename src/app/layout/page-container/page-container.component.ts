import { Component, input } from '@angular/core';

@Component({
	selector: 'yo-page-container',
	standalone: true,
	host: { class: 'd-block' },
	templateUrl: './page-container.component.html',
	styleUrl: './page-container.component.scss',
})
export class PageContainerComponent {
	readonly title = input.required<string>();
}

