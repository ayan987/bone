import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const currentUserToken = localStorage.getItem('token')?.slice(1, -1);
    const currentAccessToken = localStorage.getItem('accessToken')?.slice(1, -1);
    if (currentUserToken && !request.url.startsWith(environment.msGraphApiUrl)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUserToken}`,
        },
      });
    }

    if (currentAccessToken && request.url.startsWith(environment.msGraphApiUrl)){
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentAccessToken}`,
        },
      });
    }

    return next.handle(request);
  }
}
