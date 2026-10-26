import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminAuth } from '../../services/admin-auth';
import { DepannageInquiry, InquiriesApi } from '../../services/inquiries-api';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  inquiries: DepannageInquiry[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private inquiriesApi: InquiriesApi,
    private auth: AdminAuth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadInquiries();
  }

  loadInquiries(): void {
    this.loading = true;
    this.errorMessage = '';

    this.inquiriesApi.getDepannage().subscribe({
      next: (inquiries) => {
        this.inquiries = inquiries;
        this.loading = false;
      },
      error: (err) => {
        console.error('Aanvragen laden mislukt', err);
        if (err.status === 401) {
          this.logout();
          return;
        }
        this.errorMessage = 'Aanvragen laden is mislukt.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}

