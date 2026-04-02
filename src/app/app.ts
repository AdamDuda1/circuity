import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from './menu/menu';
import { Globals } from './globals';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, Menu],
	templateUrl: './app.html',
	styleUrl: './app.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
	constructor(public globals: Globals) {}

	ngOnInit() {
		this.globals.init();
	}
}
