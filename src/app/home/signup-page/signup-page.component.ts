import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { RestAPIService } from '../../_services/rest-api.service';
import { AlertService } from '../../_services';
import { Subject } from 'rxjs';
declare let $: any;

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})

export class SignupPageComponent implements OnInit {
  type:String='user'
  params_email:string;
  email:string;
  disable_email_field:boolean= false;
  first_name:string;
  last_name:string;
  password:string;
  mobile_number:any;
  agree:any;
  private unsubscribe$ = new Subject();
  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private authenticateService: AuthenticationService,
    private restApiService: RestAPIService,
    private alertService: AlertService
  ){
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if(params['type'])
        this.type = params['type'];
      
      if(params['type']){
        this.params_email = params['email'];
      }

    });
  }
  
  /* 
   *  Angular Default lifecycle method
  */
  ngOnInit(){
    this.alertService.setTitle( 'Signup' );//alert service for set title

    var obj = this;
    if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
      obj.authenticateService.checkExpiryStatus();
    }
    $(".toggle-password").click(function() {
      $(this).toggleClass("fa-eye fa-eye-slash");
      var input = $($(this).attr("toggle"));
      if (input.attr("type") == "password") {
        input.attr("type", "text");
      } else {
        input.attr("type", "password");
      }
    });
    var pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
    if(this.params_email && this.params_email.toString().trim() && pattern.test(this.params_email.toString().trim())){
      this.email = this.params_email.toString().trim();
      this.disable_email_field = true;
    }
  }
  
  /* 
  *  Function to signup based on action type
  */
  signUp(form:NgForm,signup_type){
   if(form && form.status == 'VALID'){
      var pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
      if(signup_type=='user' || signup_type === undefined){
        if(form.value.first_name && form.value.first_name.trim() && form.value.last_name && form.value.last_name.trim() && form.value.password && form.value.password.trim() && form.value.password.trim().length>=6  
          && form.value.mobile_number && form.value.mobile_number.internationalNumber && form.value.email && form.value.email.trim() && 
          pattern.test(form.value.email.trim()) && form.value.agree){
          var user={
            "email":form.value.email.trim(),
            "mobile":form.value.mobile_number.internationalNumber.replace(/ /g,""),
            "password":form.value.password.trim(),
            "status":true,
            "userProfile":{
              "firstName":form.value.first_name.trim(),
              "lastName":form.value.last_name.trim(),
              "status":true
            }
          }
          this.restApiService.postAPI('user/signup',user,(response)=>{
            if(response){
              if(response['success']==false && response['message']){
                if(response['message'].indexOf('Error: User with email:') !== -1){
                  this.alertService.showNotification("Email ID already exists",'error');
                }else{
                  this.alertService.showNotification(response['message'].toString(),'error');
                }
                return false;
              }
              if(response['id']){
                form.reset();
                this.alertService.showAlertBottomNotification('Registration Successful, please check your inbox to confirm your account');
                setTimeout(()=>{return this.router.navigateByUrl('/login'); },2000);
              }
            }
          });
        }else{
          this.alertService.showNotification('One or more field is required','error');
          return false;
        }
      }else if(signup_type=='Organizer'){
        if(form.value.first_name && form.value.first_name.trim() && form.value.last_name && form.value.last_name.trim() && form.value.password && form.value.password.trim() && form.value.password.trim().length>=6  
          && form.value.mobile_number && form.value.mobile_number.internationalNumber && 
          form.value.email && form.value.email.trim() && pattern.test(form.value.email.trim()) && form.value.agree && form.value.school_name && form.value.school_name.trim()){
          var educator={
            "user":{
              "email":form.value.email.trim(),
              "mobile":form.value.mobile_number.internationalNumber.replace(/ /g,""),
              "password":form.value.password.trim(),
              "status":true,
              "userProfile":{
                "firstName":form.value.first_name.trim(),
                "lastName":form.value.last_name.trim(),
                "status":true
              }
            },
            "school":{
              "name":form.value.school_name.trim()
            }
          }
          this.restApiService.postAPI('user/signupAsEducator',educator,(response)=>{
            if(response){
              if(response['success']==false && response['message']){
                this.alertService.showNotification(response['message'].toString(),'error');
                return false;
              }
              if(response['id']){
                form.reset();
                this.alertService.showAlertBottomNotification('Registration Successful, please check your inbox to confirm your account');
                setTimeout(()=>{return this.router.navigateByUrl('/login'); },2000);
              }
            }
          });
        }else{
          this.alertService.showNotification('One or more field is required','error');
          return false;
        }
      }
    }
  }

  

  /*
  * default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  createUsers(){
    for(var i=0; i<100; i++){
      var chars = 'abcdefghijklmnopqrstuvwxyz';
      var generated_email = chars[Math.floor(Math.random()*26)] + Math.random().toString(36).substring(2,11) + '@storytwinkle.com';
      var user={
        "email": generated_email,
        "mobile":Math.floor(Math.random() * 8999999999 + 1000000000),
        "password":generated_email,
        "status":true,
        "userProfile":{
          "firstName":chars[Math.floor(Math.random()*26)] + Math.random().toString(36).substring(2,11),
          "lastName":chars[Math.floor(Math.random()*26)] + Math.random().toString(36).substring(2,11),
          "status":true
        }
      }
      this.restApiService.postAPI('user/signup',user,(response)=>{
        if(response){
        }
      });
    }
  }
  
  // phoneForm = new FormGroup({
	// 	phone: new FormControl(undefined, [Validators.required])
	// });

}
