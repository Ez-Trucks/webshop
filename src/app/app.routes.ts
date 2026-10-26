import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { AdminProducts } from './pages/admin-products/admin-products';
import { AdminOrders } from './pages/admin-orders/admin-orders';
import { adminAuthGuard } from './services/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'products',
    component: Products,
  },
  {
    path:'products/:id',
    loadComponent:()=> import('./products/product-detail/product-detail')
      .then(m=>m.ProductDetail)
  },
  {
    path: 'cart',
    redirectTo: 'products',
  },
  {
    path: 'checkout',
    redirectTo: 'products',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/admin-login/admin-login').then((m) => m.AdminLogin),
  },
  {
    path: 'admin/login',
    redirectTo: 'login',
  },
  {
    path:'admin',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/ad-assistant',
    loadComponent: () => import('./pages/admin-ad-assistant/admin-ad-assistant').then(m => m.AdminAdAssistant),
    canActivate: [adminAuthGuard],
    canDeactivate: [(component: { dirty: boolean }) => !component.dirty || window.confirm('Je hebt niet-opgeslagen wijzigingen. Wil je de pagina verlaten?')],
  },
  {
    path:'admin/products', component:AdminProducts, canActivate: [adminAuthGuard]
  },
  {
    path:'admin/orders', component:AdminOrders, canActivate: [adminAuthGuard]
  },
  { path: 'payment-success', loadComponent: () => import('./pages/payment-success/payment-success').then(m => m.PaymentSuccess) },
  { path: 'payment-cancel', loadComponent: () => import('./pages/payment-cancel/payment-cancel').then(m => m.PaymentCancel) },
  {
    path: '**',
    redirectTo: '',
  },
];


