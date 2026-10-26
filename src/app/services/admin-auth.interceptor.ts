import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminAuth } from './admin-auth';
import { API_BASE_URL } from '../config/api.config';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AdminAuth).getToken();

  const target = new URL(req.url, window.location.origin);
  const api = new URL(API_BASE_URL, window.location.origin);
  const apiPath = api.pathname.replace(/\/$/, '');
  const targetsApi = target.origin === api.origin && (target.pathname === apiPath || target.pathname.startsWith(`${apiPath}/`));

  if (!token || !targetsApi) {
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

