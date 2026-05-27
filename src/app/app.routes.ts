import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
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
    path: 'cart',component:Cart
  },
  {
    path: 'checkout', component:Checkout
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


