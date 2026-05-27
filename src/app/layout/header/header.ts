import { Component } from '@angular/core';
import { Router, RouterLink,RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart';
import { AdminAuth, AuthUser } from '../../services/admin-auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  totalQuantity = 0;
  user: AuthUser | null = null;

  constructor(
    private cartService:CartService,
    private auth: AdminAuth,
    private router: Router,
  ){
    this.cartService.items$.subscribe(()=>{this.totalQuantity = this.cartService.getTotalQuantity();});
    this.auth.user$.subscribe((user) => (this.user = user));
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}

