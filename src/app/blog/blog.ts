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

interface BlogComment {
	id: number;
	author: string;
	text: string;
	created_at: string;
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
	comments = signal<Record<number, BlogComment[]>>({});

	private nextCommentId = 1;

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
		this.error.set(null);

		try {
			const response = await fetch(this.globals.database + 'blog/read', {});

			if (!response.ok) {
				this.error.set(`HTTP error! status: ${response.status}`);
				this.posts.set([]);
				return;
			}

			const posts = (await response.json()) as BlogPost[];
			this.posts.set(posts);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to fetch blog posts.';
			this.error.set(message);
			this.posts.set([]);
		} finally {
			this.isLoading.set(false);
		}
	}

	getComments(postId: number): BlogComment[] {
		return this.comments()[postId] ?? [];
	}

	addComment(postId: number, author: string, text: string): void {
		const trimmed = String(text ?? '').trim();
		if (!trimmed) return;

		const a = (author ?? '').trim() || 'Anonymous';
		const comment: BlogComment = {
			id: this.nextCommentId++,
			author: a,
			text: trimmed,
			created_at: new Date().toISOString()
		};

		this.comments.update(map => {
			const existing = map[postId] ? [...map[postId]] : [];
			existing.unshift(comment);
			return { ...map, [postId]: existing };
		});
	}

	protected readonly _Toast = _Toast;
	protected readonly navigator = navigator;
	protected readonly location = location;
}
