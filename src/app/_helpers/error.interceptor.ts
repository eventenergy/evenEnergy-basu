import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthenticationService } from '../_services/authentication.service';
import { Router } from '@angular/router';
import { AlertService } from '../_services';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    currentErrorCount: number = 0;
    maxErrorCount:number = 3;
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        private alertService: AlertService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe( tap(val => 
            {if(val instanceof HttpResponse) if(this.currentErrorCount > 0) {console.log('setting current error count to 0');this.currentErrorCount = 0;}}
        ), catchError(err => {
            if (err.status === 401) {
                this.currentErrorCount += 1;
                console.log('error count is at, ', this.currentErrorCount);
                if (this.currentErrorCount > this.maxErrorCount) {
                    this.authenticationService.postLogout();
                    this.router.navigate(['/login']);
                    this.alertService.showNotification('Your session has expired. Please signin to continue.')
                }
            }
            const error = err.error.message || err.statusText;
            return throwError(err);
        })
       )
    }
}
