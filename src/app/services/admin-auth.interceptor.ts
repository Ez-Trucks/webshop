import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminAuth } from './admin-auth';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AdminAuth).getToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};

