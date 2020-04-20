import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from '../_services/authentication.service';
import { Location } from '@angular/common';
import { DataService } from '../_services/data.service';
import { Subject } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    private role:string;
    private unsubscribe$ = new Subject();
    
    constructor(
        private router: Router,
        private authenticationService:AuthenticationService,
        private location:Location,
        private dataService: DataService,
        private activatedRoute: ActivatedRoute
    ){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean{
        if(this.authenticationService.isLoggedIn()){
            this.dataService.getRole.takeUntil(this.unsubscribe$).subscribe((role_name)=>{
                this.role=role_name;
            });
            const permission = route.data["permission"];
            if(this.role && permission && permission.length>0 && permission.indexOf(this.role) != -1){
                return this.authenticationService.isLoggedIn();
            }
            // alert('Permission denied');
            this.location.back();
            return false;
        }else{
            this.router.navigate(['/login'], {queryParams: {'returnUrl':state.url}});
            return this.authenticationService.isLoggedIn();
        }
    }

    /*
    * default Angular Destroy Method
    */
    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
  }
