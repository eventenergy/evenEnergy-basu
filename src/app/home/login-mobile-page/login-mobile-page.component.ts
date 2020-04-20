import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthenticationService, RestAPIService, AlertService } from 'src/app/_services';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login-mobile-page',
  templateUrl: './login-mobile-page.component.html',
  styleUrls: ['./login-mobile-page.component.scss']
})
export class LoginMobilePageComponent implements OnInit {
  private unsubscribe$ = new Subject();
  mobile_number_display_screen_status:boolean = true;
  mobile_number;
  show_otp_screen_status:boolean = false;
  first_otp_number:number;
  second_otp_number:number;
  third_otp_number:number;
  fourth_otp_number:number;
  fifth_otp_number:number;
  sixth_otp_number:number;

  currentValue: string;
  backSpacePressed: boolean;

  constructor(
    private router:Router,
    private authenticateService: AuthenticationService,
    private restApiService: RestAPIService,
    private alertService: AlertService,
  ) { }


  /*
  * Angular default life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Login' );//alert service for set title

    var obj = this;
    if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
      obj.authenticateService.checkExpiryStatus();
    }
  }

  /*
  * Function to send OTP
  */
  sendOtp(form: NgForm){
    this.alertService.showLoader();
    if(form && form.valid && form.status == 'VALID'){
      if(this.mobile_number && this.mobile_number.internationalNumber){
        // this.restApiService.getData('user/generateOtp/'+this.mobile_number.internationalNumber.replace(/ /g,""),(response)=>{
        this.restApiService.getData('user/generateOtp/'+this.mobile_number.internationalNumber.replace(/ /g,""),(response)=>{
          this.alertService.hideLoader();
          if(response && response['status'] && response['message']){
            this.mobile_number_display_screen_status = false;
            this.show_otp_screen_status = true;
            this.alertService.showAlertBottomNotification(response['message']);
          }else if(response && !response['status'] && response['message']){
            this.alertService.showAlertBottomNotification(response['message']);
            return false;
          }
        }, (error)=>{this.alertService.hideLoader();this.alertService.showNotification('An error occured while generating OTP. Please try again later.')});
      }
    }
  }

  /*
  * Function to sendd OTP once again
  */
  sendOtpOnceAgain(){
    this.alertService.showLoader();
    this.first_otp_number=this.second_otp_number=this.third_otp_number=this.fourth_otp_number=this.fifth_otp_number=this.sixth_otp_number = null;
    if(this.mobile_number && this.mobile_number.internationalNumber){
      this.restApiService.getData('user/generateOtp/'+this.mobile_number.internationalNumber.replace(/ /g,""),(response)=>{
        this.alertService.hideLoader();
        if(response && response['status'] && response['message']){
          this.alertService.showAlertBottomNotification(response['message']);
        }else if(response && !response['status'] && response['message']){
          this.alertService.showAlertBottomNotification(response['message']);
          return false;
        }
      });
    }else{
      this.alertService.hideLoader();
      this.alertService.showNotification('Something went wrong', 'error');
    }
  }

  /*
  * Function to check entered OTP
  */
  checkOTP(form: NgForm){
    this.alertService.showLoader();
    if(form && form.valid && form.status == 'VALID'){
      if(this.mobile_number && this.mobile_number.number){
        let otp_all = this.first_otp_number.toString()+this.second_otp_number.toString()+this.third_otp_number.toString()+this.fourth_otp_number.toString()+this.fifth_otp_number.toString()+this.sixth_otp_number.toString();
        this.authenticateService.login({username:this.mobile_number.internationalNumber.replace(/ /g,""), password: otp_all}, '');
      }
    }
  }

  /*
  * Function to change next input
  */
  nextInput(event, prev,curr, next){
    
    //check if the key pressed is infact a number    
    if(isFinite(event.key)){
      //set only the key presed as input value
      (<HTMLInputElement>document.getElementById(curr)).value = event.key;
      if(next){
        this.currentValue = (<HTMLInputElement>document.getElementById(next)).value;
        document.getElementById(next).focus();
      }
      return;
    }

    if(event.key == 'Backspace'){
      if(!this.currentValue) {
        //prev is "" for last element, hence this check
        if(prev){
          document.getElementById(prev).focus();
          this.currentValue = (<HTMLInputElement>document.getElementById(prev)).value;
        }
      }
      else this.currentValue =  (<HTMLInputElement>document.getElementById(curr)).value;
    }

  }

  /*
  * Function to sendd OTP once again
  */
  changeMobileNumber(){
    this.first_otp_number=this.second_otp_number=this.third_otp_number=this.fourth_otp_number=this.fifth_otp_number=this.sixth_otp_number = null;
    this.show_otp_screen_status = false;
    this.mobile_number_display_screen_status = true;
    if(this.mobile_number && this.mobile_number.internationalNumber)
      this.mobile_number = this.mobile_number.internationalNumber;
  }

  /*
  * default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
