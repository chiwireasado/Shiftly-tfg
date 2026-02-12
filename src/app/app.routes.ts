import { Routes } from '@angular/router';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/home/home').then(m => m.Home),
    },
    {
        path: '',
        loadComponent: () => import('./components/panel-control/panel-control').then(m => m.PanelControl),
    }
];
