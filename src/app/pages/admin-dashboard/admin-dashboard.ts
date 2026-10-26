import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../config/api.config';

interface Readiness { ready: boolean; checks: { key: string; label: string; ok: boolean; required: boolean }[]; }
@Component({
  selector: 'app-admin-dashboard', standalone: true, imports: [RouterLink],
  templateUrl: './admin-dashboard.html', styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);
  readiness: Readiness | null = null;
  checking = false;
  statusError = '';
  ngOnInit() { this.check(); }
  check() {
    this.checking = true; this.statusError = '';
    this.http.get<Readiness>(`${API_BASE_URL}/admin/readiness`).subscribe({
      next: value => { this.readiness = value; this.checking = false; },
      error: err => {
        this.checking = false;
        this.statusError = err.status === 401 ? 'Je sessie is verlopen. Log opnieuw in.' : 'De servercontrole is nog niet beschikbaar. Controleer of de nieuwste API-versie online staat.';
      },
    });
  }
}
