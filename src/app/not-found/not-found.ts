import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-not-found',
	imports: [RouterLink],
	template: `
    <div style="margin-left: auto; margin-right: auto;">
	    <h1 class="text-6xl font-bold">404</h1>
	    <p class="mt-4 text-xl">Not found</p>
	    <a routerLink="/" class="mt-6 underline">Return home</a>
    </div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
