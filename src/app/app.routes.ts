import { Routes } from '@angular/router';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/home/home').then(m => m.Home),
    },
    {
        path: 'panel-control',
        loadComponent: () => import('./components/panel-control/panel-control').then(m => m.PanelControl),
    },
    {
        path: 'registro',
        loadComponent: () => import('./components/registro/registro').then(m => m.Registro),
    },
    {
        path: 'loginAdmin',
        loadComponent: () => import('./components/login-admin/login-admin').then(m => m.LoginAdmin),
    },
    {
        path: 'loginUser',
        loadComponent: () => import('./components/login-user/login-user').then(m => m.LoginUser),
    },
    {
        path: 'auth',
        loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
        children: [
            {
                path: 'loginAdmin',
                loadComponent: () => import('./components/login-admin/login-admin').then(m => m.LoginAdmin),
            },
            {
                path: 'loginUser',
                loadComponent: () => import('./components/login-user/login-user').then(m => m.LoginUser),
            }
        ]
    }
];
