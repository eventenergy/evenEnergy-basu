import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestAPIService, AuthenticationService, AlertService, DataService } from '../../_services/index';
import { Subject } from 'rxjs';
import { API_URL_LINK, AWS_DEFAULT_LINK } from 'src/app/config';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  private unsubscribe$ = new Subject();
  user_details:any;
  userProfilename:string;
  isAdmin:boolean = false;
  userEmail: string;
  EmailName:string;
  constructor(
    private router:Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService: HelperService,
    private alertService: AlertService,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.alertService.setTitle( 'User Profile' );//alert service for set title
    
    // Admin role call 
    this.isAdmin = false;
    if(this.dataService.hasHighestRole() == 'ADMIN'){
      this.isAdmin = true;
    }
  
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((check_response)=>{
      if(check_response){
        if(check_response['user'] && check_response['user']['id']){
          obj.userEmail = check_response['user']['email'];
          var EmailName = obj.userEmail.substring(0, obj.userEmail.lastIndexOf("@"));
          obj.restApiService.getData('user/'+check_response['user']['id'], (response)=>{
            if(response && response['id'] && response.userProfile){
              var user=[];
              user=response;
              if(response.userProfile.firstName && response.userProfile.lastName) {
                this.userProfilename = response.userProfile.firstName + " " + response.userProfile.lastName;
              if(response.userProfile.defaultSnapId){
                this.restApiService.getData('snap/'+response.userProfile.defaultSnapId,(snap_details_response)=>{
                  if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                    user['userStaticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  }
                });
              }
              obj.user_details = user;
            } else this.userProfilename = EmailName;
          }
          });
        }
        
        else{
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
