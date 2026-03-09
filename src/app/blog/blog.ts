import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { _Toast } from '../toasts';

interface BlogPost {
	id: number;
	title: string;
	text: string;
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
	private readonly supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

	posts = signal<BlogPost[]>([]);
	isLoading = signal(true);
	error = signal<string | null>(null);

	ngOnInit() {
		let q = _Toast.loading("Fetching blog posts...");
		this.fetchBlogPosts().then(() => {
			q.close();
			_Toast.info("Fetching complete!", {duration: 500});
		});
	}

	private async fetchBlogPosts() {
		try {
			this.isLoading.set(true);
			this.error.set(null);

			const {data, error} = await this.supabase.from('blog').select('*');

			if (error) {
				console.error('Error fetching blog posts:', error);
				this.error.set(error.message);
				this.posts.set([]);
				return;
			}

			this.posts.set((data as BlogPost[]) || []);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error occurred';
			console.error('Unexpected error:', err);
			_Toast.error(message);
			this.error.set(message);
			this.posts.set([]);
		} finally {
			this.isLoading.set(false);
		}
	}
}
