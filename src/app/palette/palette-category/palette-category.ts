import { Component, input } from '@angular/core';

@Component({
	selector: 'app-palette-category',
	imports: [],
	templateUrl: './palette-category.html',
	styleUrl: './palette-category.css'
})
export class PaletteCategory {
	name = input.required<string>();
	defaultOpened = input.required<boolean>();
    protected readonly toString = toString;
}
