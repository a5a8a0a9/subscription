import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'yo-footer',
	standalone: true,
	host: { class: 'd-block' },
	imports: [RouterLink, RouterLinkActive, MatIconModule],
	templateUrl: './footer.component.html',
	styleUrl: './footer.component.scss',
})
export class FooterComponent {}
