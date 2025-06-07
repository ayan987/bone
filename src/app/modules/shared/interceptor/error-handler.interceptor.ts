import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(public toastr: ToastrService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          let errorMessage = '';

          if ((error.status === 404 && request.url.includes(environment.msGraphApiUrl)) || (error.status === 404 && request.url.includes(environment.importTimesheetServiceUrl))) {
            return throwError(error);
          }

          if (error.status === 500) {
            errorMessage = 'Internal Server Error';
          } else if (error.status === 404) {
            errorMessage = 'Not Found';
          } else if (error.status === 403) {
            errorMessage = 'Forbidden';
          } else if (error.status === 400) {
            errorMessage = 'Incorrect input';
          // } else if (error.status === 409) {
          // errorMessage = 'conflict'
          //   }
          } else if (error.status === 401) {
            errorMessage = 'Unauthorized';
          } else if (error.status === 422) {
            errorMessage = 'Unprocessable Content';
          } else if (error.status === 0) {
            errorMessage = 'Unknown Error Occured - Please check your internet connection';
          } else {
            errorMessage = error.message || 'Unknown error';
          }
          if (errorMessage && error.status !== 409) {
            this.toastr.error(errorMessage, '', {
              timeOut: 5000,
              closeButton: true,
            });
          }
        }
        return throwError(error);
      })
    );
  }
}
