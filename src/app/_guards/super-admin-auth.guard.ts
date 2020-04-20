import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../_services';
import { map, switchMap } from 'rxjs/operators';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminAuthGuard implements CanActivate {

  constructor(
    private authenticationService: AuthenticationService,
    private location: Location){ }
  
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.authenticationService.getUserObject().pipe(
      switchMap((UserObj: any)=>{
        if(UserObj.user.superAdmin) return of(true);
        else {
          this.location.back();
          return of(false);
        }
      })
    )
  }
  
}
