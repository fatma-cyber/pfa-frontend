import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log("Intercepting request:", req.url);
  const token = localStorage.getItem('auth-token');
  console.log("Token found:", token ? "Yes" : "No");
  
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log("Added Authorization header");
    return next(authReq);
  }
  
  return next(req);
};