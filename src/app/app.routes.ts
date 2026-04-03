import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./home/home').then(m => m.Home),
	},
	{
		path: 'browse',
		loadComponent: () => import('./browse/browse').then(m => m.Browse),
	},
	{
		path: 'play',
		loadComponent: () => import('./play/play').then(m => m.Play),
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
