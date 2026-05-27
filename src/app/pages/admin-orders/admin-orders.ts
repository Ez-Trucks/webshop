import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderApi } from '../../services/order-api';
import { Order, OrderStatus } from '../../models/order-model';
import { AdminAuth } from '../../services/admin-auth';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  orders: Order[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  statuses: OrderStatus[] = ['pending', 'paid', 'shipped'];

  constructor(
    private orderApi: OrderApi,
    private auth: AdminAuth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderApi.getAll().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Orders laden mislukt', err);
        if (err.status === 401) {
          this.logout();
          return;
        }
        this.errorMessage = 'Bestellingen laden is mislukt.';
        this.loading = false;
      },
    });
  }

  updateStatus(order: Order, newStatus: string): void {
    const status = newStatus as OrderStatus;

    this.errorMessage = '';
    this.successMessage = '';

    this.orderApi.updateStatus(order.id, status).subscribe({
      next: (updatedOrder) => {
        order.status = updatedOrder.status;
        order.updatedAt = updatedOrder.updatedAt;
        this.successMessage = `Status van bestelling ${order.id} werd bijgewerkt.`;
      },
      error: (err) => {
        console.error('Status updaten mislukt', err);
        this.errorMessage = 'Status bijwerken is mislukt.';
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}

