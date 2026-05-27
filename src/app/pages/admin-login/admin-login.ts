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

  mode: 'login' | 'register' = 'login';
  loading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.errorMessage = '';
  }

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

  submitRegister(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.errorMessage = 'Vul je naam, e-mail en een wachtwoord van minstens 8 tekens in.';
      return;
    }

    this.loading = true;
    const { name, email, password } = this.registerForm.getRawValue();

    this.auth
      .register(name, email, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/products'),
        error: (err) => {
          this.errorMessage = err.status === 409
            ? 'Er bestaat al een account met dit e-mailadres.'
            : 'Account maken is mislukt. Probeer opnieuw.';
        },
      });
  }
}
