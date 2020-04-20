import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../_services';
import { HelperService } from '../../_helpers';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-school-dashboard',
  templateUrl: './school-dashboard.component.html',
  styleUrls: ['./school-dashboard.component.scss']
})
export class SchoolDashboardComponent implements OnInit {
  private unsubscribe$ = new Subject();
  school_details;
  refresh_token:number;
  constructor(
    private router:Router,
    private authenticateService: AuthenticationService,
    private activatedRoute:ActivatedRoute,
    private helperService:HelperService,
    private location:Location
  ) {
    this.activatedRoute.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if(!this.refresh_token && params['refresh']){
        this.refresh_token=params['refresh'];
      }
      if(params['refresh'] && this.refresh_token && params['refresh']>this.refresh_token){
        this.refresh_token=params['refresh'];
        this.ngOnInit();
        this.ngAfterViewInit();
      }
      this.location.replaceState(this.location.path().split('?')[0], '');
    });
  }

  /* 
  * Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          this.authenticateService.getSelectedSchoolDetails((school_details_response)=>{
            this.school_details = school_details_response;
          });
        }else{
          return obj.router.navigate(['/login']);
        }
      }else{
        if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
          obj.authenticateService.checkExpiryStatus();
        }
        return obj.router.navigate(['/login']);
      }
    });
  }

  /* 
  * Angular default life cycle method 
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }

  /*
  * Default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event){
    this.helperService.updateDefaultImageUrlHelper(event);
  }

}
