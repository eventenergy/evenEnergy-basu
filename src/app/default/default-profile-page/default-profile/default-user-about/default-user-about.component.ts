import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { RestAPIService, AuthenticationService } from 'src/app/_services';
import { Router } from '@angular/router';
import { API_URL_LINK, AWS_DEFAULT_LINK } from 'src/app/config';

@Component({
  selector: 'app-default-user-about',
  templateUrl: './default-user-about.component.html',
  styleUrls: ['./default-user-about.component.scss']
})
export class DefaultUserAboutComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @Input() user_id;
  @Input() school_id;
  user_details;
  constructor(
    private restApiService: RestAPIService,
    private router:Router,
    private authenticateService: AuthenticationService,
  ) { }

  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
            obj.showUserDetails();
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
  * Get teacher based on classroom
  */
  showUserDetails(){
    if(this.user_id){
      this.restApiService.getData('user/'+this.user_id,(user_details_response)=>{
        if(user_details_response && user_details_response.id && user_details_response.userProfile){
          this.user_details = [];
          this.user_details['id']=user_details_response.id;
          this.user_details['email']=user_details_response.email;
          this.user_details['mobile']=user_details_response.mobile;
          this.user_details['firstName']=user_details_response.userProfile.firstName;
          this.user_details['lastName']=user_details_response.userProfile.lastName;
          if(user_details_response.userProfile['defaultSnapId']){
            this.restApiService.getData('snap/'+user_details_response.userProfile['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                this.user_details['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
              }
            });
          }else{
            this.user_details['staticDpImg']='';
          }
          this.user_details['imgName']=(user_details_response.userProfile.firstName ? user_details_response.userProfile.firstName.slice(0,1) : '') + (user_details_response.userProfile.lastName ? user_details_response.userProfile.lastName.slice(0,1) : '');
        }
      });
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
