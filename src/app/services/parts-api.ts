import { Injectable } from '@angular/core';
import { Part } from '../models/part-model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PartsApi {
  private baseUrl = `${API_BASE_URL}/parts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Part[]> {
    return this.http.get<Part[]>(this.baseUrl);
  }

  getOne(id: string): Observable<Part> {
    return this.http.get<Part>(`${this.baseUrl}/${id}`);
  }

  create(part: Omit<Part, 'id'>): Observable<Part> {
    return this.http.post<Part>(this.baseUrl, part);
  }

  update(id: string, part: Partial<Part>): Observable<Part> {
    return this.http.patch<Part>(`${this.baseUrl}/${id}`, part);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

