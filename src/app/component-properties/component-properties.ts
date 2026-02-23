import { Component } from '@angular/core';
import { Globals } from '../globals';

@Component({
	selector: 'category',
	standalone: true,
	template: `
		<div class="category-container">
			<div class="category-bar"></div>

			<div class="category-title">
				<ng-content></ng-content>
			</div>

			<div class="category-bar"></div>
		</div>
	`,
	styleUrl: 'component-properties.css'
})
export class Category {}

@Component({
	selector: 'app-component-properties',
	imports: [
		Category
	],
	templateUrl: './component-properties.html',
	styleUrl: './component-properties.css'
})
export class ComponentProperties {
	constructor(public globals: Globals) {}

}
