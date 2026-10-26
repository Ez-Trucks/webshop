import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { CartService } from '../../services/cart';
import { AdminAuth, AuthUser } from '../../services/admin-auth';
import { LanguageCode, LanguageService } from '../../services/language';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  languageService = inject(LanguageService);
  totalQuantity = 0;
  user: AuthUser | null = null;
  activeFragment = '';
  activePath = '/';

  constructor(
    private cartService:CartService,
    private auth: AdminAuth,
    private router: Router,
  ){
    this.cartService.items$.subscribe(()=>{this.totalQuantity = this.cartService.getTotalQuantity();});
    this.auth.user$.subscribe((user) => (this.user = user));
    this.updateActiveState(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateActiveState(event.urlAfterRedirects));
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  changeLanguage(event: Event): void {
    this.languageService.setLanguage((event.target as HTMLSelectElement).value as LanguageCode);
  }

  private updateActiveState(url: string): void {
    const [path, fragment = ''] = url.split('#');
    this.activePath = path || '/';
    this.activeFragment = fragment;
  }
}

