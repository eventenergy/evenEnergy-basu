import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HelperService } from '../../_helpers/index';
import { RestAPIService, AlertService, AuthenticationService } from '../../_services/index';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-user-change-password',
  templateUrl: './user-change-password.component.html',
  styleUrls: ['./user-change-password.component.css']
})
export class UserChangePasswordComponent implements OnInit {
  private unsubscribe$ = new Subject();
 
  password:string;
  confirm_password:string;
  current_password:string;
  
  email:string='';
  user_id:number;
  existing_current_password:string;
  mobile:string='';

  constructor(
    private router: Router,
    private route:ActivatedRoute,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private alertService: AlertService,
    private location: Location,
    private authenticateService:AuthenticationService,
    private cookie: CookieService
  ) {
   }
  
  /*
  * default Angular lifecycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Change Password' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((check_response)=>{     
      if(check_response){
        if(check_response['user'] && check_response['user']['id']){
          obj.restApiService.getData('user/'+check_response['user']['id'], (response)=>{
            // response['password']='basavakumar.sg@sanradiance.com'; //default set
            if(response && response['id'] && response['email']){
                obj.user_id = response['id'];
                // obj.existing_current_password = response['password'];
                obj.email = response['email'];
                obj.mobile = response['mobile'];
            }else{
              return obj.router.navigate(['/login']);
            }
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
  * Function to reset password
  */
  changePassword(form){
    if( this.user_id && this.email){
      if(form && form.current_password && form.current_password.trim() && form.password && form.password.trim() && form.confirm_password && form.confirm_password.trim() && form.password.length>=6 && form.confirm_password.length>=6){
        if(form.password.trim()!==this.current_password){
        if(form.password.trim()==form.confirm_password.trim()){
          this.restApiService.postAPI('user/updateProfile/resetPassword',{'id':this.user_id,'currentPassword': form.current_password, 'password': form.password},(response)=>{
            if(response){
              if(response.success){
                this.alertService.showAlertBottomNotification('New password updated');
                setTimeout(()=>{this.authenticateService.postLogout() }, 0);
              } else {
                this.alertService.showNotification('Current password does not match','error');
              }
            } 
          })      
        } else {
          this.alertService.showNotification('Password not matched','error');
          return false;
        } 
      } else {
        this.alertService.showNotification('New password should not be same as old password','error');
        return false;
      }
    } else {
      this.alertService.showNotification('Something went wrong, please try again','error');
      return false;
    }
  } else{
    this.alertService.showNotification('Something went wrong, please try again','error')
    return false;
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
