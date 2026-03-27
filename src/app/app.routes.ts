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
		path: 'admin',
		loadComponent: () => import('./admin/admin').then(m => m.Admin),
	},
	{
		path: 'admin/:section',
		loadComponent: () => import('./admin/admin').then(m => m.Admin),
	},
	{
		path: '**',
		loadComponent: () => import('./not-found/not-found').then(m => m.NotFound),
	}
];
