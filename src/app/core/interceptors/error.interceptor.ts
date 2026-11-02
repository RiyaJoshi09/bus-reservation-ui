import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '../models/auth.models';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/');

      if (err.status === 0) {
        snackBar.open('Cannot reach the server. Please try again.', 'Close', {
          duration: 5000,
        });
      } else if (err.status === 401 && !isAuthEndpoint) {
        // Token expired or invalid on a normal request
        auth.logout();
        snackBar.open('Session expired. Please log in again.', 'Close', {
          duration: 5000,
        });
      }

      // Always hand components a clean ErrorResponse
      const apiError: ErrorResponse =
        err.error && typeof err.error === 'object' && err.error.message
          ? err.error
          : {
              timestamp: new Date().toISOString(),
              httpStatus: err.status,
              error: err.statusText,
              message: 'Something went wrong. Please try again.',
            };

      return throwError(() => apiError);
    })
  );
};