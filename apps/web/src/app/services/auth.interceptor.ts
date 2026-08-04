import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/')) {
    const token = localStorage.getItem('doselog-token');
    if (token) {
      return next(req.clone({
        setHeaders: { Authorization: 'Bearer '.concat(token) },
      }));
    }
  }
  return next(req);
};
