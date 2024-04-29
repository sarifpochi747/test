import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading-transition.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  constructor(private readonly loadingService: LoadingService) { }
  stack: number = 0

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const isSessionVerification = request.url.includes('authsession');

    if (!isSessionVerification) {
      this.stack += 1;
      this.loadingService.setLoadingState(true);
    }
    return next.handle(request).pipe(

      finalize(() => {
        if (this.stack > 0) this.stack -= 1;
        if (
          this.stack == 0 ||
          request.url.includes('detection') ||
          request.url.includes('facial-alert') ||
          request.url.includes('nearest')
        ) {
          this.stack = 0
          
          this.loadingService.setLoadingState(false);
        }
      })
    );
  }
}
