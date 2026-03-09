import { Component, ChangeDetectionStrategy, signal, inject, Signal } from '@angular/core';
import { PaletteComponent } from './palette-component/palette-component';
import { Globals } from '../globals';
import { ElectricalComponent } from '../components/component-type-interface';
import { PaletteCategory } from './palette-category/palette-category';

type Category = {
	name: Signal<string>;
	icon: Signal<string>;
	defaultOpened: boolean;
	components: ElectricalComponent[];
}

@Component({
	selector: 'app-palette',
	imports: [PaletteComponent, PaletteCategory],
	template: `
		<a class="w-full text-center gray m" href="#" (click)="tutorial()">
			<div class="tutorial"><span class="material-symbols-outlined">tour</span> Tutorial</div>
		</a>

        @for (category of categories; track categories.indexOf(category)) {
            <app-palette-category [name]="category.name()" [icon]="category.icon()"
                                  [defaultOpened]="category.defaultOpened">
                @for (component of category.components; track component.id) {
                    <app-palette-component [component]="component"/>
                }
            </app-palette-category>
        }

	`,
	styles: `
		* {
			display: flex;
			flex-direction: column;
		}

		.tutorial {
			margin-top: 5px;
			display: flex;
			flex-direction: row !important;
			justify-content: center !important;
			font-size: small;
		}

		.material-symbols-outlined {
			font-size: medium;
			position: relative;
			top: 2px;
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Palette {
	private globals = inject(Globals);
	components = signal<ElectricalComponent[]>([]);
	categories: Category[] = [];
	defaultCategories: string[] = [];

	constructor() {
		this.components.set(this.globals.palette);

		this.defaultCategories = [ // TODO move to globals?
			this.globals.constants.categoryName.basicLogicGates,
			this.globals.constants.categoryName.input,
			this.globals.constants.categoryName.output
		];

		for (const component of this.components()) {
			let category = this.categories.find(c => c.name() == component.category);
			if (!category) {
				category = {name: signal(component.category), icon: signal(''), defaultOpened: this.defaultCategories.includes(component.category), components: []};
				this.categories.push(category);
			}
			category.components.push(component);
		}

		const favorites: Category = {name: signal(this.globals.constants.favoriteCategory), icon: signal('star'), defaultOpened: true, components: []};

		const favoritesIDs = JSON.parse(localStorage.getItem('favorites') ?? '[]') as number[];
		for (const id of favoritesIDs) {
			const component = this.components().find(c => c.id == id);
			if (component) favorites.components.push(component);
		}

		if (favoritesIDs.length > 0) {
			this.categories.unshift(favorites);
		}
	}

	tutorial() {
		this.globals.tutorial.open();
	}
}
