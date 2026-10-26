import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { API_BASE_URL } from '../../config/api.config';
import { LanguageService } from '../../services/language';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  languageService = inject(LanguageService);

  depannageSubmitted = false;
  depannageSending = false;
  depannageSuccess = '';
  depannageError = '';

  depannageForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    company: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    location: ['', [Validators.required, Validators.minLength(3)]],
    vehicleInfo: ['', [Validators.required, Validators.minLength(3)]],
    urgency: ['Deze week', [Validators.required]],
    message: [''],
  });

  submitDepannage(): void {
    this.depannageSubmitted = true;
    this.depannageSuccess = '';
    this.depannageError = '';

    if (this.depannageForm.invalid) {
      this.depannageError = this.languageService.t('requestRequired');
      return;
    }

    this.depannageSending = true;

    this.http
      .post(`${API_BASE_URL}/inquiries/depannage`, this.depannageForm.getRawValue())
      .pipe(finalize(() => (this.depannageSending = false)))
      .subscribe({
        next: () => {
          this.depannageSuccess =
            this.languageService.t('requestReceived');
          this.depannageSubmitted = false;
          this.depannageForm.reset({
            name: '',
            company: '',
            email: '',
            phone: '',
            location: '',
            vehicleInfo: '',
            urgency: 'Deze week',
            message: '',
          });
        },
        error: (err) => {
          console.error('Depannageaanvraag versturen mislukt', err);
          this.depannageError =
            this.languageService.t('requestFailed');
        },
      });
  }
}

