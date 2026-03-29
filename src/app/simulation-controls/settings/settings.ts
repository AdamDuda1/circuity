import { Component, signal } from '@angular/core';
import { Globals } from '../../globals';
import {
	enable as enableDarkMode,
	disable as disableDarkMode,
	auto as followSystemColorScheme
} from 'darkreader';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: '../popup-panel.css',
})
export class Settings {
	constructor(public globals: Globals) {}

	setDarkMode() {
		if (localStorage.getItem('darkMode') === 'true') {
			enableDarkMode({
				brightness: 90,
				contrast: 100,
				sepia: 20,
			});
		} else disableDarkMode();

		//followSystemColorScheme();
	}

	ngOnInit() {
		this.setDarkMode();
	}

	protected readonly localStorage = localStorage;
}
