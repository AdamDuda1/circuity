import { Component, signal } from '@angular/core';
import { Globals } from '../../globals';
import { Footer } from '../../footer/footer';

@Component({
	selector: 'app-settings',
	imports: [
		Footer
	],
	templateUrl: './settings.html',
	styleUrl: '../popup-panel.css'
})
export class Settings {
	constructor(public globals: Globals) {}

	protected readonly localStorage = localStorage;
}
