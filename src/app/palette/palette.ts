import { Component, ChangeDetectionStrategy, signal, inject, Signal } from '@angular/core';
import { PaletteComponent } from './palette-component/palette-component';
import { Globals } from '../globals';
import { ElectricalComponent } from '../components/component-type-interface';
import { PaletteCategory } from './palette-category/palette-category';
import { _Toast } from '../toasts';

type Category = {
	name: Signal<string>;
	icon: Signal<string>;
	defaultOpened: boolean;
	components: ElectricalComponent[];
}

@Component({
	selector: 'app-palette',
	imports: [PaletteComponent, PaletteCategory],
	host: {
		'(document:keydown)': 'onDocumentKeydown($event)'
	},
	template: `
        <div class="scroll">
	        @for (category of categories; track categories.indexOf(category)) {
		        <app-palette-category [name]="category.name()" [icon]="category.icon()"
		                              [defaultOpened]="category.defaultOpened">
			        @for (component of category.components; track component.id) {
				        <app-palette-component [component]="component"/>
			        }
		        </app-palette-category>
	        }
        </div>


        <a class="text-center gray m" href="#" (click)="tutorial()">
	        <div class="tutorial"><span class="material-symbols-outlined">tour</span> Tutorial</div>
        </a>
	`,
	styles: `
		:host {
			box-shadow: 0 0 12px 0 #00000073, inset 0 0 7px 4px #0000000d;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}

		.scroll {
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

		a {
			position: absolute;
			bottom: 7px;
			left: 7px;
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

	onDocumentKeydown($event: KeyboardEvent) {
		if ($event.key !== 'f' && $event.key !== 'F' && this.globals.hoveredPaletteComponent() !== null) return;
		_Toast.loading('WASS?', {duration: 1000});
		_Toast.info(this.globals.hoveredPaletteComponent()!.name);

		const favoritesIDs = JSON.parse(localStorage.getItem('favorites') ?? '[]') as number[];
		if (favoritesIDs.includes(this.globals.hoveredPaletteComponent()!.id)) return;

		favoritesIDs.push(this.globals.hoveredPaletteComponent()!.id);
		localStorage.setItem('favorites', JSON.stringify(favoritesIDs));

		let favorites = this.categories.find(c => c.name() === this.globals.constants.favoriteCategory);
		if (!favorites) {
			_Toast.warning("aint no favorites")
			favorites = {
				name: signal(this.globals.constants.favoriteCategory),
				icon: signal('star'),
				defaultOpened: true,
				components: []
			};
			this.categories.unshift(favorites);
		}

		_Toast.info('checkpoint')

		if (!favorites.components.some(component => component.id === this.globals.hoveredPaletteComponent()!.id)) {
			favorites.components.push(this.globals.hoveredPaletteComponent()!);
			_Toast.info('pushed')
		}
	}
}
