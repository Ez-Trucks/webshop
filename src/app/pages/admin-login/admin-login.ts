import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AdminAuth } from '../../services/admin-auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  private auth = inject(AdminAuth);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submitLogin(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Vul je e-mail/gebruikersnaam en wachtwoord in.';
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.getRawValue();

    this.auth
      .login(username, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.router.navigateByUrl(response.user.role === 'admin' ? '/admin' : '/products');
        },
        error: () => {
          this.errorMessage = 'Login mislukt. Controleer je gegevens.';
        },
      });
  }
}
