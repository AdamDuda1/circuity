import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { _Toast } from '../toasts';
import { Globals } from '../globals';

interface BlogPost {
	id: number;
	title: string;
	text: string;
	media_type: string;
	media_link: string;
	created_at: string;

	[key: string]: unknown;
}

@Component({
	selector: 'app-blog',
	templateUrl: './blog.html',
	styleUrl: './blog.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [CommonModule]
})
export class Blog implements OnInit {
	constructor(public globals: Globals) {}

	posts = signal<BlogPost[]>([]);
	isLoading = signal(true);
	error = signal<string | null>(null);

	ngOnInit() {
		let q = _Toast.loading('Fetching blog posts...');
		if (this.globals.blog_loaded()) q.close();
		this.fetchBlogPosts().then(() => {
			if (q) q.close();
			if (!this.globals.blog_loaded()) _Toast.info('Fetching complete!', {duration: 500, dismissible: true});
			this.globals.blog_loaded.set(true);
		});
	}

	async fetchBlogPosts(): Promise<void> {
		this.isLoading.set(true);

		try {
			const response = await fetch(this.globals.database + 'blog/read', {});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const posts = (await response.json()) as BlogPost[];
			this.posts.set(posts);
		} finally {
			this.isLoading.set(false);
		}
	}
}
