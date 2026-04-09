import { Globals } from '../../globals';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

type Visibility = 'public' | 'private';

interface CreateProjectPayload {
	content: string;
	author: string;
	name: string;
	description: string;
	secret: string;
	visibility?: Visibility;
}

export class SaveLoad {
	constructor(public globals: Globals) {}
	private readonly http: HttpClient = inject(HttpClient);

	exportJSON() {
		const json = JSON.stringify(this.globals.data.getCurrentDesignJSON());
		const blob = new Blob([json], {type: 'application/json'});

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'circuity-design' /*+ new Date("DD-MM-YYYY")*/ + '.json'; // TODO filename?
		a.click();
		URL.revokeObjectURL(url);
	}

	getCurrentDesignSizeLabel(): string {
		const json = JSON.stringify(this.globals.data.getCurrentDesignJSON());
		const bytes = new Blob([json], {type: 'application/json'}).size;

		if (bytes < 1024) {
			return `${bytes} B`;
		}

		const kilobytes = bytes / 1024;
		if (kilobytes < 1024) {
			return `${kilobytes.toFixed(2)} KB`;
		}

		return `${(kilobytes / 1024).toFixed(2)} MB`;
	}

	async createCloudProject(payload: Omit<CreateProjectPayload, 'content'>) {
		const body: CreateProjectPayload = {
			...payload,
			content: JSON.stringify(this.globals.data.getCurrentDesignJSON())
		};

		return await firstValueFrom(
			this.http.post<{
				status: 'success';
				project: {
					id: number;
					content: string;
					author: string;
					name: string;
					description: string;
					visibility: Visibility;
				};
			}>(
				this.globals.database + 'projects/create',
				body
			)
		);
	}

	async loadCloudProject(secret: string) {
		const response = await firstValueFrom(
			this.http.post<{
				status: 'success';
				project: {
					id: number;
					name: string;
					content: string;
					created_at: string;
				};
			}>(
				this.globals.database + 'projects/single-project',
				{secret}
			)
		);

		const content = JSON.parse(response.project.content);
		const loaded = this.globals.data.loadJSON(content);

		return {
			loaded,
			name: response.project.name
		};
	}
}
