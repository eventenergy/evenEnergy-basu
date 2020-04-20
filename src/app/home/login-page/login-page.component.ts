import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../../_services/authentication.service';
import { Subject } from 'rxjs';
import { RestAPIService, AlertService } from 'src/app/_services';
declare let $: any;

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  private unsubscribe$ = new Subject();
  returnUrl: string;
  email:string;
  message:string;

  constructor(
    private router:Router,
    private authenticateService: AuthenticationService,
    private route: ActivatedRoute,
    private restApiService: RestAPIService,
    private alertService: AlertService,
  ){ }

  loginUserModel=new LoginUserModel();
  email_error:boolean= false;
  password_error:boolean= false;

  /*
  * Angular default life cycle method
  */
  ngOnInit(){
    this.alertService.setTitle( 'Login' );//alert service for set title

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    this.message = this.route.snapshot.queryParams['message'] || '';
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.loginUserModel.email = this.email;
    var obj = this;
    // if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
    //   obj.authenticateService.checkExpiryStatus();
    // }
    if(this.authenticateService.isLoggedIn()) {
      this.router.navigateByUrl('/')
      return;
    };
    $(".toggle-password").click(function() {
      $(this).toggleClass("fa-eye fa-eye-slash");
      var input = $($(this).attr("toggle"));
      if (input.attr("type") == "password") {
        input.attr("type", "text");
      } else {
        input.attr("type", "password");
      }
    });
  }

  ngAfterViewInit(): void {
    if(this.message)
      this.alertService.showNotification(this.message);
  }

  /*
  *  Login form
  */
  login(form: NgForm){
    if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
      this.authenticateService.checkExpiryStatus();
    }
    var email_pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
    if(this.loginUserModel.email && this.loginUserModel.email.trim() && email_pattern.test(this.loginUserModel.email.trim()) && this.loginUserModel.password && this.loginUserModel.password.trim()){
      this.alertService.showLoader();
      this.authenticateService.login({username:this.loginUserModel.email.trim(), password: this.loginUserModel.password.trim()}, this.returnUrl);
    }else{
      !this.loginUserModel.email ? this.email_error=true : this.email_error= false;
      !email_pattern.test(this.loginUserModel.email) ? this.email_error=true : this.email_error= false;
      !this.loginUserModel.password ? this.password_error=true : this.password_error= false
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


/* 
* User Model for login 
*/
export class LoginUserModel{
  constructor(
    public email:string='',
    public password:string='',
  ){}
  
}