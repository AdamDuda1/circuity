import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Globals } from '../globals';

interface PublicProject {
	id: number;
	content: string;
	author: string;
	name: string;
	description: string;
	visibility: 'public' | 'private';
	created_at: string;
}

@Component({
	selector: 'app-browse',
	imports: [],
	templateUrl: './browse.html',
	styleUrl: './browse.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Browse {
	private readonly http = inject(HttpClient);

	constructor(public globals: Globals) {
		this.fetchProjects();
	}

	projects = signal<PublicProject[]>([]);
	isLoading = signal(true);
	error = signal<string | null>(null);

	fetchProjects(limit = 9, page = 1) {
		this.isLoading.set(true);
		this.error.set(null);
		const url = `${this.globals.database}projects/get?limit=${limit}&page=${page}`;
		this.http.get<PublicProject[]>(url).subscribe({
			next: (res) => {
				this.projects.set(res ?? []);
				this.isLoading.set(false);
			},
			error: (error: unknown) => {
				this.projects.set([]);
				const message = error instanceof Error ? error.message : 'Failed to fetch public projects.';
				this.error.set(message);
				this.isLoading.set(false);
			}
		});
	}
}
