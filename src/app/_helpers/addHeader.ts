import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, NEVER, of } from 'rxjs';
import { concat } from 'rxjs';
import { AuthenticationService, RestAPIService } from '../_services';
import { filter, mergeMap, tap, first } from 'rxjs/operators';

@Injectable()
export class AddHeader implements HttpInterceptor {
    
    constructor(private authenticationService: AuthenticationService,
        private restApiService: RestAPIService,
        private authService: AuthenticationService){}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const headers = new HttpHeaders(this.restApiService.getBearerHeader());
        const authReq = request.clone({
            headers: headers
          });
        return next.handle(authReq);
    }

}