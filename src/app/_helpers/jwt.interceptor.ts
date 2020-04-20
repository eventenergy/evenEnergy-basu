import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, BehaviorSubject, NEVER, of } from 'rxjs';
import { concat } from 'rxjs';
import { AuthenticationService } from '../_services';
import { filter, mergeMap, tap, first } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService){ }
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var refreshInProgress$ : Observable<Boolean> = this.authenticationService.getRefreshInProgerss();
        // console.log('Jwt interceptor intercepting values for ' + request.url);
        // return refreshInProgress$.pipe(tap((val)=>{console.log('taping value from refresh IN Progress', val)}),filter((val)=>{return val==false}),first(), mergeMap(()=>next.handle(request)));
        return refreshInProgress$.pipe(filter((val)=>{return val==false}),first(), mergeMap(()=>next.handle(request)));
    }

}