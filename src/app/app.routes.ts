import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./home/home').then(m => m.Home),
	},
	{
		path: 'blog',
		loadComponent: () => import('./blog/blog').then(m => m.Blog),
	},
	{
		path: '**',
		loadComponent: () => import('./not-found/not-found').then(m => m.NotFound),
	},
];
