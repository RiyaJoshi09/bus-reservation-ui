import { Routes } from '@angular/router';
import { authGuard, guestGuard, loggedInGuard, roleGuard } from './core/guards/auth.guards';

const placeholder = () =>
  import('./shared/components/placeholder/placeholder.component').then(
    (m) => m.PlaceholderComponent
  );

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'change-password',
    canActivate: [loggedInGuard],
    loadComponent: () =>
      import('./features/auth/change-password/change-password.component').then(
        (m) => m.ChangePasswordComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'search' },
      {
        path: 'search', // PUBLIC: no guard
        loadComponent: () =>
          import('./features/bus-search/search/search.component').then((m) => m.SearchComponent),
      },
      {
        path: 'book/:tripId', // PROTECTED: login required, USER only
        canActivate: [authGuard, roleGuard(['USER'])],
        loadComponent: placeholder,
        data: { title: 'Book ticket' },
      },
      {
        path: 'provider/register', // PUBLIC
        loadComponent: () =>
          import('./features/provider/provider-register/provider-register.component').then(
            (m) => m.ProviderRegisterComponent
          ),
      },
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard(['SUPER_ADMIN'])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'providers' },
          {
            path: 'providers',
            loadComponent: () =>
              import('./features/admin/provider-approvals/provider-approvals.component').then(
                (m) => m.ProviderApprovalsComponent
              ),
          },
        ],
      },
      {
        path: 'super-manager',
        canActivate: [authGuard, roleGuard(['SUPER_MANAGER'])],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'managers/new' },
          {
            path: 'managers/new',
            loadComponent: () =>
              import('./features/super-manager/create-manager/create-manager.component').then(
                (m) => m.CreateManagerComponent
              ),
          },
        ],
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile-page/profile-page.component').then((m) => m.ProfilePageComponent),
      },
      { path: 'trips', canActivate: [authGuard, roleGuard(['TRIP_MANAGER'])], loadComponent: placeholder, data: { title: 'Trip Manager Home' } },
      { path: 'buses', canActivate: [authGuard, roleGuard(['BUS_MANAGER'])], loadComponent: placeholder, data: { title: 'Bus Manager Home' } },
    ],
  },
  { path: '**', redirectTo: 'search' },
];