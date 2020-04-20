import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { HelperService } from '../../_helpers/index';
import { RestAPIService, AlertService } from '../../_services/index';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  private unsubscribe$ = new Subject();
  password:string;
  confirm_password:string;
  email:string='';
  token:string='';
  constructor(
    private router: Router,
    private route:ActivatedRoute,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private alertService: AlertService,
    private location: Location
  ) {
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
        if(params['user'] && params['token']){
          this.email = params['user'];
          this.token = params['token'];
        }else{
          this.alertService.showNotification('Something went wrong');
          this.router.navigateByUrl('/login');
        }
    });
   }
  
  /*
  * default Angular lifecycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Reset Password' );//alert service for set title

    this.location.replaceState('/user/forgot-password/reset');
    // const urlTree = this.router.parseUrl(this.router.url);
    // const urlWithoutParams = urlTree.root.children['primary'].segments.map(it => it.path).join('/');
    // if(urlWithoutParams=='user/forgot-password/reset'){
    //   this.forgot_password_view= false;
    // }
  }


  /*
  * Function to reset password
  */
  changePassword(form){
    if(this.email && this.token){
       if(form && form.password && form.password.trim() && form.confirm_password && form.confirm_password.trim() && form.password.length>=6 && form.confirm_password.length>=6){
        if(form.password.trim()==form.confirm_password.trim()){
          this.restApiService.postAPI('user/resetPassword/'+this.token,{'email':this.email.trim(), 'password':form.password.trim()},(response)=>{
            if(response){
              if(response['success'] && response['message']){
                this.alertService.showNotification(response['message']);
              }else if(!response['success'] && response['message']){
                this.alertService.showNotification('Password link has Expired');
              }else{
                this.alertService.showNotification('Something went wrong','error');
              }
              setTimeout(()=>{ this.router.navigateByUrl('/login');}, 3000);
            }else{
              this.alertService.showNotification('Something went wrong','error');
            }
          })
        }else{
          this.alertService.showNotification('Password not matched','error');
          return false;
        }
      }else{
        if(form && form.password && form.confirm_password &&  (form.password.trim().length<6 || form.confirm_password.trim().length<6)){
          this.alertService.showNotification('Your password must be at least 6 characters long','error');
        }else{
          this.alertService.showNotification('One or more field is required','error');
        }
        return false;
      }
    }else{
      this.alertService.showNotification('Something went wrong, please try again','error');
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
