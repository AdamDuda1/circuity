import { Component, signal } from '@angular/core';
import { Globals } from '../../globals';


@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: '../popup-panel.css',
})
export class Settings {
	constructor(public globals: Globals) {}

	protected readonly localStorage = localStorage;
}
