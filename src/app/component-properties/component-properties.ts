import { Component } from '@angular/core';
import { Globals } from '../globals';

@Component({
	selector: 'category',
	standalone: true,
	template: `
		<div class="category-container">
			<div class="bar"></div>

			<div class="title">
				<ng-content></ng-content>
			</div>

			<div class="bar"></div>
		</div>
	`,
	styles: [`
		.category-container {
			display: flex;
			align-items: center;
			width: 100%;
			gap: 1rem;
			color: gray;
		}

		.bar {
			flex: 1;
			height: 1px;
			background: linear-gradient(
				to right,
				transparent,
				rgba(0, 0, 0, 0.15),
				transparent
			);
		}

		.title {
			white-space: nowrap;
			font-weight: 600;
			font-size: 0.9rem;
			letter-spacing: 0.05em;
			text-transform: uppercase !important;
			opacity: 0.8;
			font-size: 16px !important;
		}
	`]
})
export class Category {

}

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
