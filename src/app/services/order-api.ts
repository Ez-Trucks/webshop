import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrder, Order } from '../models/order-model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class OrderApi {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/orders`;
  private paymentsUrl = `${API_BASE_URL}/payments`;

  create(order: CreateOrder): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }

  getOne(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  getPublicSummary(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}/public`);
  }

  updateStatus(id: string, status: 'pending' | 'paid' | 'shipped'): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/status`, { status });
  }
  
  createPayment(orderId: string, amount: number) {
    return this.http.post<{ checkoutUrl: string }>(`${this.paymentsUrl}/create`, {
      orderId,
      amount,
    });
  }
}
