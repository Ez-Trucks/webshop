import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export type DepannageInquiry = {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone: string;
  location: string;
  vehicleInfo: string;
  urgency: string;
  message?: string | null;
  status: string;
  createdAt: string;
};

@Injectable({
  providedIn: 'root',
})
export class InquiriesApi {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/inquiries`;

  getDepannage(): Observable<DepannageInquiry[]> {
    return this.http.get<DepannageInquiry[]>(`${this.baseUrl}/depannage`);
  }
}
