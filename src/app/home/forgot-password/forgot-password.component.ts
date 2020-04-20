import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestAPIService, AuthenticationService, AlertService } from '../../_services/index';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  email:string;
  constructor(
    private router:Router,
    private authenticateService: AuthenticationService,
    private restApiService: RestAPIService,
    private alertService: AlertService,
  ) { }

  /* 
   *  Angular Default lifecycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Forgot Password' );//alert service for set title

    var obj = this;
    if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
      obj.authenticateService.checkExpiryStatus();
    }
  }

  /* 
  *  Function to send link to email
  */
  forgotPassword(form){
    var email_pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
    if(form && form.email && form.email.trim() && email_pattern.test(form.email.trim())){
      this.restApiService.postAPI('user/resetPassword/request',{"email":form.email.trim()},(response)=>{
        if(response && response['success'] && response['message']){
            this.alertService.showAlertBottomNotification(response['message']);
            setTimeout(()=>{ this.router.navigateByUrl('/login'); },3000)
        }else if(response && !response['success'] && response['message']){
          this.alertService.showNotification(response['message'], 'error');
          return false;
        }else{
          this.alertService.showNotification('Something went wrong, please try again', 'error');
          return false;
        }
      });
    }else{
      this.alertService.showNotification('We didn’t recognise this email address. <br>Please check it’s correct and try again.', 'error');
      return false;
    }
  }

}
