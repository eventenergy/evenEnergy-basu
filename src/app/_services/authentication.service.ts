import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';

// import {RequestOptions} from '@angular/common/http/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { API_URL_LINK, AWS_DEFAULT_LINK, CLIENT_ID, CLIENT_SECRET } from '../config';
import { Router, RouteReuseStrategy } from '@angular/router';
import { RestAPIService } from './rest-api.service';
import { DataService } from './data.service';
import { Observable, Subject } from 'rxjs';
import { AlertService } from './alert.service';
import { CustomRouteReuseStrategy } from './CustomRouteReuseStrategy';
import { CookieService } from 'ngx-cookie-service';
import { first } from 'rxjs/operators';
import { TicketGenerationService } from './ticket-generation.service';

@Injectable()
export class AuthenticationService {
  isLoginSubject = new BehaviorSubject<boolean>(this.hasToken());
  userObjectSubject = new BehaviorSubject<any>(this.restApiService.getOfflineLoggedUserDetails());
  public refreshInProgress = new BehaviorSubject<boolean>(false);
  private school_details = new Array<{ school_id: number, school_name: string, schoolStaticDpImg: string }>();
  private unsubscribe$ = new Subject();
  timeout: any;
  tokenRefreshError: boolean = false;
  httpWithoutInteception: HttpClient;
  constructor(
    private http: HttpClient,
    private handler: HttpBackend,
    private router: Router,
    private restApiService: RestAPIService,
    private dataService: DataService,
    private alertService: AlertService,
    private cookie: CookieService,
    private ticketGenerationService: TicketGenerationService
    // private routeReuseStrategy: RouteReuseStrategy
  ) {
    this.httpWithoutInteception = new HttpClient(handler);
    if (!!localStorage.getItem('MyApp_Auth')) {
      //logout if refresh_token is not found
      if(!this.cookie.check('refresh_token')){
        this.postLogout();
        return;
      }

      //refresh token immediatly if the access-token is not found
      if(!this.cookie.check('access_token')) {
        this.refreshToken();
        return;
      }

      else{
        var futureRefreshTimeStamp = parseInt(this.cookie.get('expiry_timestamp'));
        //if we have a valid futureRefreshTime set timer
        if(futureRefreshTimeStamp) {
          var timeForTimer = futureRefreshTimeStamp - new Date().getTime();
          console.log('got time for refresh', timeForTimer);
          if(timeForTimer > 0) this.setRefreshTokenTimer(timeForTimer);
          else this.refreshToken();
        }
        //refresh token immediatly if the expiry_timestamp is invalid(or does not exists)
        else this.refreshToken();
      }
    }
    else this.postLogout();
  }

  /*
  * Function to get status of the token 
  * present in local storage
  */
  private hasToken(): boolean {

    if (localStorage.getItem('MyApp_Auth') && !this.cookie.check('refresh_token')) {
      this.postLogout();
    }
    
    return !!localStorage.getItem('MyApp_Auth');

  }

  obtainAccessToken(loginData, returnUrl, callback, obj) {
    console.log('obtain access token called');
    let params = new URLSearchParams();
    params.append('username', loginData.username);
    params.append('password', loginData.password);
    params.append('grant_type', 'password');
    // params.append('client_id','fooClientIdPassword');
    console.log("client details: " + CLIENT_ID + ":" + CLIENT_SECRET);
    var cred =
    {
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': 'Basic ' + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
      accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      withCredentials: 'true',
      "X-Requested-With": 'XMLHttpRequest'
    };
    let headers =
      new HttpHeaders(cred);
    // let options = new RequestOptions({ headers: headers });

    this.httpWithoutInteception.post(API_URL_LINK + 'oauth/token',
      params.toString(), { headers: headers }).pipe(first()).takeUntil(this.unsubscribe$).subscribe((response: any) => {
        if (response) {
          localStorage.setItem('MyApp_Auth', JSON.stringify(cred));
          this.setRefreshTokenTimer(this.returnTimerValue(response.expires_in));
          this.saveToken(response);
          this.registerDevice(loginData, returnUrl, callback, obj);
        }
      },
        (err) => {
          this.alertService.hideLoader();
          this.postLogout();
          // if(err){
          //   error.
          // }
          // this.alertService.showAlertBottomNotification('Username or password wrong');
          this.alertService.showNotification('Email or password wrong', 'error');
          // this.alertService.showNotification('Something went wrong when logging you in, Please try again later');
        }
      );
  }
  returnTimerValue(expires_in: number): number {
    const minRefreshTime = 300;
    var timeInSeconds = expires_in - minRefreshTime > minRefreshTime ? expires_in - minRefreshTime : minRefreshTime;

    //convert from s to ms
    return timeInSeconds * 1000
  }

  registerDevice(loginData, returnUrl, callback, obj) {
    var cred: any = this.restApiService.getBearerHeader();
    console.log(cred);
    if (cred) {
      let headers = new HttpHeaders(cred);
      // let options = new RequestOptions({ headers: headers });
      let params = {
        'userName': loginData.username,
        'deviceId': this.cookie.get('e_device_id'),
        'clientId': CLIENT_ID
      };//new URLSearchParams();
      // params.append('username',loginData.username);
      // params.append('deviceId',this.cookie.get('e_device_id'));    
      // params.append('clientId',CLIENT_ID);
      this.http.post(API_URL_LINK + 'manageToken/registerDevice',
        params, { headers: headers }).pipe(first()).takeUntil(this.unsubscribe$).subscribe((response: any) => {
          if (response) {
            this.getUserDetail(loginData, returnUrl, callback, obj);
          }
        },
          err => {
            this.alertService.hideLoader();
            this.alertService.showNotification('There was an error logging you in. Please try again later.')
            this.postLogout();
          });
    }
  }

  getUserDetail(credentials, returnUrl, callback, obj) {
    var cred: any = this.restApiService.getBearerHeader();
    if (!cred) {
      //No header
    }
    // let headers = 
    // new HttpHeaders(cred);
    const headers = new HttpHeaders(cred);
    console.log('get user details called');
    this.http.get(API_URL_LINK + 'user/login', { headers: headers }).takeUntil(this.unsubscribe$).subscribe(response => {
      if (response) {
        console.log('response from user/login');
        console.log(response);
        if (response['user'] && response['user']['id']) {
          // localStorage.setItem('MyApp_Auth', JSON.stringify(cred));
          localStorage.setItem('loggedUser', JSON.stringify(response));
          var today = new Date();
          today.setHours(today.getHours() + 3);
          var expire_time = today.getTime();
          localStorage.setItem('expire_time', expire_time.toString());

          this.isLoginSubject.next(true);
          this.userObjectSubject.next(response);
          if (response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
            var admin = false, teacher = false, parent = false;
            response['schoolDetail'].forEach(element => {
              if (Array.isArray(element.role) && element.role.length > 0) {
                element.role.forEach(role_name => {
                  if (role_name == 'ADMIN') {
                    this.dataService.changeRole(role_name);
                    this.dataService.changeSchoolId(element.school.id);
                    this.dataService.changeUserId(response['user']['id']);
                    admin = true;
                    return false;
                  }
                });
              }
            });
            if (!admin) {
              response['schoolDetail'].forEach(element => {
                if (Array.isArray(element.role) && element.role.length > 0) {
                  element.role.forEach(role_name => {
                    if (role_name == 'TEACHER') {
                      this.dataService.changeRole(role_name);
                      this.dataService.changeSchoolId(element.school.id);
                      this.dataService.changeUserId(response['user']['id']);
                      teacher = true;
                      return false;
                    }
                  });
                }
              });
            }
            if (!teacher && !admin) {
              response['schoolDetail'].forEach(element => {
                if (Array.isArray(element.role) && element.role.length > 0) {
                  element.role.forEach(role_name => {
                    if (role_name == 'PARENT') {
                      this.dataService.changeRole(role_name);
                      this.dataService.changeSchoolId(element.school.id);
                      this.dataService.changeUserId(response['user']['id']);
                      parent = true;
                      return false;
                    }
                  });
                }
              });
            }
            this.alertService.hideLoader();
            if (admin || teacher || parent) {
              if (returnUrl && returnUrl != '/login') {
                return this.router.navigate([returnUrl]);
              }
              return this.router.navigateByUrl('/activity');
            }
          }
          this.dataService.changeRole('USER');
          this.dataService.changeSchoolId(0);
          this.dataService.changeUserId(response['user']['id']);
          if (returnUrl && returnUrl != '/login') {
            if (callback) {
              callback(obj);
            }
            return this.router.navigate([returnUrl]);
          }
          return this.router.navigateByUrl('/activity');
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        }
        this.alertService.hideLoader();
      }
      this.alertService.hideLoader();
    }, error => {
      this.alertService.hideLoader();
      this.postLogout();
      // this.alertService.showAlertBottomNotification('Username or password wrong');
      this.alertService.showNotification('Username or password wrong', 'error');
      // if(error.error instanceof ErrorEvent){
      //   alert('Username or Password wrong');
      // }else{
      //   if(error.status==0){
      //     alert("Username or Password wrong");
      //     return;
      //   }
      //   if(error.error){
      //     if(error.error+"".indexOf("401")){
      //       alert('Username or Password wrong');
      //     }else{
      //       alert("server did not reached");
      //     }
      //   }
      // }
    });
  }

  saveToken(token) {
    var expireDate = new Date().getTime() + (1000 * (token.expires_in - 60));
    var expireTimestamp = (new Date().getTime()+(token.expires_in*1000)).toString();
    this.cookie.set("access_token", token.access_token, new Date(expireDate), '/');
    this.cookie.set("refresh_token", token.refresh_token, new Date((expireDate * 2)), '/');
    this.cookie.set("expiry_timestamp",expireTimestamp, new Date((expireDate)) , '/');
    
  }

  canRefreshToken() {
    //   console.log('can refresh called');
    //   if(!this.cookie.check("access_token")){
    //     if(!this.cookie.check("refresh_token")){
    //       // return this.router.navigateByUrl('/login');
    //      this.postLogout();
    //       return false;
    //     }
    //     return true;
    //     // return undefined;
    // }
    //   return false;
    if (this.cookie.check('refresh_token')) {
      return true
    } else return false
  }

  refreshToken() {
    console.log('this is the current router link, ', this.router.url);
    let params = new URLSearchParams();
    params.append('refresh_token', this.cookie.get('refresh_token'));
    params.append('grant_type', 'refresh_token');
    this.refreshInProgress.next(true);
    // params.append('client_id','fooClientIdPassword');
    var cred =
    {
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': 'Basic ' + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
      accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      withCredentials: 'true',
      "X-Requested-With": 'XMLHttpRequest'
    };
    let headers = new HttpHeaders(cred);
    this.httpWithoutInteception.post(API_URL_LINK + 'oauth/token',
      params.toString(), { headers: headers }).takeUntil(this.unsubscribe$).subscribe((response: any) => {
        if (response) {
          this.setRefreshTokenTimer(this.returnTimerValue(response.expires_in));
          localStorage.setItem('MyApp_Auth', JSON.stringify(cred));
          this.saveToken(response);
          this.refreshInProgress.next(false);
        }
      },
        (err) => {
          this.alertService.hideLoader();
          if (err.status == 400) {
            this.refreshInProgress.error(false);
            this.refreshInProgress = new BehaviorSubject<boolean>(false);
            this.alertService.showNotification('Your login session has expired, please signin again to continue');
            this.postLogout();
            return this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
          }

          //attempt fetching refresh token again
          if (!this.tokenRefreshError) {
            this.setRefreshTokenTimer(2000);
            this.tokenRefreshError = true;
            return;
          }

          //on second error
          this.refreshInProgress.error(false);
          this.refreshInProgress = new BehaviorSubject<boolean>(false);
          this.alertService.showNotification('Your login session has expired, please signin again to continue');
          this.postLogout();
          return this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      );
  }


  setRefreshTokenTimer(expires_in: number) {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.isLoggedIn()) this.refreshToken();
    }, expires_in);
  }
  // saveToken(token){
  //   var expireDate = new Date().getTime() + (1000 * token.expires_in);
  //   this.cookie.set("access_token", token.access_token, new Date(expireDate));
  //   this.cookie.set("refresh_token", token.refresh_token, new Date((expireDate*2)));
  //   this.cookie.set("expires_in", token.expires_in);
  //   // this.router.navigate(['/']);
  // }

  // getResource(resourceUrl) : Observable<Foo>{
  //   var headers = 
  //     new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
  //     // 'Authorization': 'Bearer '+Cookie.get('access_token')});
  //     'Authorization': 'Bearer '+'access_token'});
  //   // var options = new RequestOptions({ headers: headers });
  //   // return this.http.get(resourceUrl, { headers: headers }).takeUntil(this.unsubscribe$).subscribe(response => {
  //   //   if(response){
  //   //   }
  //   // },error=>{

  //   // }

  //                 //  .catch((error:any) => 
  //                 //    Observable.throw(error.json().error || 'Server error'));
  // }

  checkCredentials() {
    // if (!Cookie.check('access_token')){
    //     this._router.navigate(['/login']);
    // }
  }

  logoutOauth2() {
    var cred: any = this.restApiService.getBearerHeader();
    this.ticketGenerationService.clearSavedSelection();
    console.log(cred);
    if (cred) {
      let headers =
        new HttpHeaders(cred);
      // let options = new RequestOptions({ headers: headers });
      var userObj: any = JSON.parse(localStorage.getItem('loggedUser'));
      console.log("loggedUser: ", userObj);
      console.log(userObj);
      if (userObj.user) {
        var username = userObj['user'].email;
        let params = {
          'userName': username,
          'deviceId': this.cookie.get('e_device_id'),
          'clientId': CLIENT_ID
        };//new URLSearchParams();
        this.httpWithoutInteception.post(API_URL_LINK + 'manageToken/revoke',
          params, { headers: headers }).takeUntil(this.unsubscribe$).subscribe((response: any) => {
            // if(response){
            //   this.postLogout();

            //   console.log("Respo -> logoutOauth2: ",response);
            //   // this.getUserDetail(undefined,undefined);
            //   // localStorage.setItem('MyApp_Auth', JSON.stringify(cred));
            //   // // localStorage.setItem('loggedUser',JSON.stringify(response));
            //   // this.saveToken(response);
            // }
          },
            // err => alert('Error while reg Device')
          );
      }
      this.postLogout();
    }
    // this.cookie.delete('access_token');
    // this._router.navigate(['/login']);
  }
  postLogout() {
    console.log('post logout called');
    localStorage.removeItem('MyApp_Auth');
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('logged_user_id');
    if (this.isLoginSubject && this.userObjectSubject) {
      this.isLoginSubject.next(false);
      this.userObjectSubject.next(false);
    }
    this.cookie.delete('access_token', '/');
    this.cookie.delete('refresh_token', '/');
    clearTimeout(this.timeout);
    // return this.router.navigateByUrl('/login');
  }

  login(credentials, returnUrl) {
    // this.loginBasicAuth(credentials, returnUrl);
    this.obtainAccessToken(credentials, returnUrl, undefined, this);
  }

  /*
  * Login function to authenticate
  */
  loginBasicAuth(credentials, returnUrl) {
    var cred = {};
    if (credentials.authorization) {
      cred = credentials ? credentials : {};
    } else {
      cred = credentials ?
        {
          authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password),
          accept: 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          withCredentials: 'true',
          "X-Requested-With": 'XMLHttpRequest'
        } : {};
    }
    const headers = new HttpHeaders(cred);
    this.http.get(API_URL_LINK + 'user/login', { headers: headers }).takeUntil(this.unsubscribe$).subscribe(response => {
      if (response) {
        if (response['user'] && response['user']['id']) {
          localStorage.setItem('MyApp_Auth', JSON.stringify(cred));
          localStorage.setItem('loggedUser', JSON.stringify(response));
          var today = new Date();
          today.setHours(today.getHours() + 3);
          var expire_time = today.getTime();
          localStorage.setItem('expire_time', expire_time.toString());

          this.isLoginSubject.next(true);
          this.userObjectSubject.next(response);
          if (response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
            var admin = false, teacher = false, parent = false;
            response['schoolDetail'].forEach(element => {
              if (Array.isArray(element.role) && element.role.length > 0) {
                element.role.forEach(role_name => {
                  if (role_name == 'ADMIN') {
                    this.dataService.changeRole(role_name);
                    this.dataService.changeSchoolId(element.school.id);
                    this.dataService.changeUserId(response['user']['id']);
                    admin = true;
                    return false;
                  }
                });
              }
            });
            if (!admin) {
              response['schoolDetail'].forEach(element => {
                if (Array.isArray(element.role) && element.role.length > 0) {
                  element.role.forEach(role_name => {
                    if (role_name == 'TEACHER') {
                      this.dataService.changeRole(role_name);
                      this.dataService.changeSchoolId(element.school.id);
                      this.dataService.changeUserId(response['user']['id']);
                      teacher = true;
                      return false;
                    }
                  });
                }
              });
            }
            if (!teacher && !admin) {
              response['schoolDetail'].forEach(element => {
                if (Array.isArray(element.role) && element.role.length > 0) {
                  element.role.forEach(role_name => {
                    if (role_name == 'PARENT') {
                      this.dataService.changeRole(role_name);
                      this.dataService.changeSchoolId(element.school.id);
                      this.dataService.changeUserId(response['user']['id']);
                      parent = true;
                      return false;
                    }
                  });
                }
              });
            }
            this.alertService.hideLoader();
            if (admin) {
              this.dataService.setHighestRole('ADMIN');
            }
            if (admin || teacher || parent) {
              if (returnUrl && returnUrl != '/login') {
                return this.router.navigate([returnUrl]);
              }
              if (response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
                console.log('school details');
                return this.router.navigateByUrl('/activity');
              } else {
                return this.router.navigateByUrl('/');
              }
            }
          }
          this.dataService.changeRole('USER');
          this.dataService.changeSchoolId(0);
          this.dataService.changeUserId(response['user']['id']);
          if (returnUrl && returnUrl != '/login') {
            return this.router.navigate([returnUrl]);
          }
          if (response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
            return this.router.navigateByUrl('/activity');
          } else {
            return this.router.navigateByUrl('/');
          }
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        }
        this.alertService.hideLoader();
      }
      this.alertService.hideLoader();
    }, error => {
      this.alertService.hideLoader();
      localStorage.clear();
      // this.alertService.showAlertBottomNotification('Username or password wrong');
      this.alertService.showNotification('Username or password wrong', 'error');
      // if(error.error instanceof ErrorEvent){
      //   alert('Username or Password wrong');
      // }else{
      //   if(error.status==0){
      //     alert("Username or Password wrong");
      //     return;
      //   }
      //   if(error.error){
      //     if(error.error+"".indexOf("401")){
      //       alert('Username or Password wrong');
      //     }else{
      //       alert("server did not reached");
      //     }
      //   }
      // }
    });
  }

  // Oauth2
  loginAutoSignedUpUserOauth(credentials, returnUrl, callback1, obj) {
    // STORYTWINKLE password
    credentials.password = 'STORYTWINKLE';
    this.obtainAccessToken(credentials, returnUrl, callback1, obj);
  }

  /* BAsic Auth */
  loginAutoSignedUpUser(credentials, returnUrl, callback1, obj) {
    var cred = {};
    if (credentials.authorization) {
      cred = credentials ? credentials : {};
    } else {
      cred = credentials ?
        {
          authorization: 'Basic ' + btoa(credentials.username + ':STORYTWINKLE'),
          accept: 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          withCredentials: 'true',
          "X-Requested-With": 'XMLHttpRequest'
        } : {};
    }
    // callback1
    const headers = new HttpHeaders(cred);
    this.http.get(API_URL_LINK + 'user/login', { headers: headers }).takeUntil(this.unsubscribe$).subscribe(response => {
      if (response) {
        if (response['user'] && response['user']['id']) {
          localStorage.setItem('MyApp_Auth', JSON.stringify(cred));
          localStorage.setItem('loggedUser', JSON.stringify(response));
          var today = new Date();
          today.setHours(today.getHours() + 3);
          var expire_time = today.getTime();
          localStorage.setItem('expire_time', expire_time.toString());

          this.isLoginSubject.next(true);
          this.userObjectSubject.next(response);
          if (response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
            var admin = false, teacher = false, parent = false;
            response['schoolDetail'].forEach(element => {
              if (Array.isArray(element.role) && element.role.length > 0) {
                element.role.forEach(role_name => {
                  if (role_name == 'ADMIN') {
                    this.dataService.changeRole(role_name);
                    this.dataService.changeSchoolId(element.school.id);
                    this.dataService.changeUserId(response['user']['id']);
                    admin = true;
                    return false;
                  }
                });
              }
            });
            if (!admin) {
              response['schoolDetail'].forEach(element => {
                if (Array.isArray(element.role) && element.role.length > 0) {
                  element.role.forEach(role_name => {
                    if (role_name == 'TEACHER') {
                      this.dataService.changeRole(role_name);
                      this.dataService.changeSchoolId(element.school.id);
                      this.dataService.changeUserId(response['user']['id']);
                      teacher = true;
                      return false;
                    }
                  });
                }
              });
            }
            if (!teacher && !admin) {
              response['schoolDetail'].forEach(element => {
                if (Array.isArray(element.role) && element.role.length > 0) {
                  element.role.forEach(role_name => {
                    if (role_name == 'PARENT') {
                      this.dataService.changeRole(role_name);
                      this.dataService.changeSchoolId(element.school.id);
                      this.dataService.changeUserId(response['user']['id']);
                      parent = true;
                      return false;
                    }
                  });
                }
              });
            }
            this.alertService.hideLoader();
            if (admin) {
              this.dataService.setHighestRole('ADMIN');
            }
            if (admin || teacher || parent) {
              if (returnUrl && returnUrl != '/login') {
                return this.router.navigate([returnUrl]);
              }
              return this.router.navigateByUrl('/activity');
            }
          }
          this.dataService.changeRole('USER');
          this.dataService.changeSchoolId(0);
          this.dataService.changeUserId(response['user']['id']);
          console.log(callback1);
          return callback1(obj);
          // if(returnUrl && returnUrl!='/login'){
          //   return this.router.navigate([returnUrl]);
          // }
          // return this.router.navigateByUrl('/activity')
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        }
        this.alertService.hideLoader();
      }
      this.alertService.hideLoader();
    }, error => {
      this.alertService.hideLoader();
      localStorage.clear();
      // this.alertService.showAlertBottomNotification('Username or password wrong');
      this.alertService.showNotification('Username or password wrong', 'error');
      // if(error.error instanceof ErrorEvent){
      //   alert('Username or Password wrong');
      // }else{
      //   if(error.status==0){
      //     alert("Username or Password wrong");
      //     return;
      //   }
      //   if(error.error){
      //     if(error.error+"".indexOf("401")){
      //       alert('Username or Password wrong');
      //     }else{
      //       alert("server did not reached");
      //     }
      //   }
      // }
    });
  }

  /*
  * Function to check user login status
  */
  isLoggedIn() {
    return this.isLoginSubject.value;
  }

  /*
  * Function to check user login status
  */
  getUserObject(): Observable<boolean> {
    return this.userObjectSubject.asObservable();
  }

  getRefreshInProgerss() {
    return this.refreshInProgress.asObservable();
  }

  /*
  * Logout function clearing all local storage elements
  */
  logout() {
    localStorage.clear();
    this.postLogout();
    // (<CustomRouteReuseStrategy>this.routeReuseStrategy).clearHandles();
    return this.router.navigateByUrl('/login');

  }

  /*
  * Function to check expiry status
  */
  checkExpiryStatus() { 
    if (localStorage.getItem('expire_time') && localStorage.getItem('MyApp_Auth')) {
      var time_now = new Date().getTime(), expire_time = parseInt(localStorage.getItem('expire_time'));
      if (time_now < expire_time) {
        this.alertService.showLoader();
        this.login(JSON.parse(localStorage.getItem('MyApp_Auth')), '');
      } else {
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  /*
  * Function to get selected School details
  */
  getSelectedSchoolDetails(callback) {
    this.school_details = [];
    if (this.dataService.hasSchoolId()) {
      this.restApiService.getData('school/' + this.dataService.hasSchoolId(), (response) => {
        if (response && response['id']) {
          if (response['defaultSnapId']) {
            this.restApiService.getData('snap/' + response['defaultSnapId'], (snap_details_response) => {
              if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                this.school_details['schoolStaticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
              }
            });
          } else {
            this.school_details['schoolStaticDpImg'] = '';
          }
          this.school_details['school_id'] = response.id;
          this.school_details['school_name'] = response.name;
          return callback && callback(this.school_details)
        }
      });
    } else {
      return callback && callback(this.school_details);
    }
  }

  /*
  * get User Details everytime
  */
  pushUpdatedDetails() {
    var credentials;
    if (localStorage.getItem('MyApp_Auth')) {
      credentials = JSON.parse(localStorage.getItem('MyApp_Auth'))
    }
    if (credentials && credentials.Authorization) {
      const headers = new HttpHeaders(credentials);
      this.http.get(API_URL_LINK + 'user/login', { headers: headers }).takeUntil(this.unsubscribe$).subscribe(response => {
        if (response) {
          if (response['user'] && response['user']['id']) {
            this.userObjectSubject.next(response);
            localStorage.setItem('loggedUser', JSON.stringify(response));
          }
        }
      });
    } else {
      this.logout();
    }
  }

  /*
  * Check User is admin for selected school
  */
  checkUserAdminStatus(school_id, child_id) {
    if (this.dataService.hasUserId() && school_id && child_id) {
      var credentials;
      if (localStorage.getItem('MyApp_Auth')) {
        credentials = JSON.parse(localStorage.getItem('MyApp_Auth'))
      }
      if (credentials && credentials.authorization) {
        const headers = new HttpHeaders(credentials);
        this.http.get(API_URL_LINK + 'user/login', { headers: headers }).takeUntil(this.unsubscribe$).subscribe(response => {
          if (response && response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
            response['schoolDetail'].forEach(element => {
              if (Array.isArray(element.role) && element.role.length > 0 && element.school.id == parseInt(school_id)) {
                var index_value = element.role.findIndex(obj => obj == 'ADMIN');
                if (index_value > -1) {
                  this.restApiService.putAPI('parent/' + child_id + '/request/school/' + school_id + '/approve', {}, (child_approve_response) => {
                    if (child_approve_response) {
                      if (child_approve_response['id']) {
                        this.userObjectSubject.next(response);
                      }
                    }
                  });
                }
              }
            });
          }
        });
      }
    }
  }

  /*
  * update basic authentication
  */
  updateBasicAuth(email, password) {
    if (email && password) {
      var credentials = {
        authorization: 'Basic ' + btoa(email + ':' + password),
        accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        withCredentials: 'true',
        "X-Requested-With": 'XMLHttpRequest'
      };
      // const headers = new HttpHeaders(credentials);
      localStorage.setItem('MyApp_Auth', JSON.stringify(credentials));
    }
  }

  isSuperAdmin() {
    var userObj = this.userObjectSubject.getValue();
    if (userObj.user) {
      return userObj.user.superAdmin;
    } else return false;
  }

  generateDeviceId() {
    const length = 25;
    var id = '';
    id += this.getClientOS();
    id += '-'
    id += this.getClientBrowser();
    id += '-'
    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (; id.length <= length;) {
      id += str.charAt(Math.floor(Math.random() * str.length));
    }
    console.log(id);
  }

  getClientOS() {
    if (navigator.appVersion.indexOf("Win") != -1) return "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) return "Mac";
    if (navigator.appVersion.indexOf("X11") != -1) return "UNIX";
    if (navigator.appVersion.indexOf("Linux") != -1) return "Linux";
    if (navigator.userAgent.indexOf("Android") != -1) return "Android";
    if (navigator.userAgent.indexOf("like Mac") != -1) return "iOS";
    return "";
  }

  getClientBrowser() {
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // In Opera 15+, the true version is after "OPR/" 
    if ((verOffset = nAgt.indexOf("OPR/")) != -1) {
      browserName = "Opera";
      fullVersion = nAgt.substring(verOffset + 4);
    }
    // In older Opera, the true version is after "Opera" or after "Version"
    else if ((verOffset = nAgt.indexOf("Opera")) != -1) {
      browserName = "Opera";
      fullVersion = nAgt.substring(verOffset + 6);
      if ((verOffset = nAgt.indexOf("Version")) != -1)
        fullVersion = nAgt.substring(verOffset + 8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
      browserName = "Microsoft Internet Explorer";
      fullVersion = nAgt.substring(verOffset + 5);
    }
    // In Chrome, the true version is after "Chrome" 
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
      browserName = "Chrome";
      fullVersion = nAgt.substring(verOffset + 7);
    }
    // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
      browserName = "Safari";
      fullVersion = nAgt.substring(verOffset + 7);
      if ((verOffset = nAgt.indexOf("Version")) != -1)
        fullVersion = nAgt.substring(verOffset + 8);
    }
    // In Firefox, the true version is after "Firefox" 
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
      browserName = "Firefox";
      fullVersion = nAgt.substring(verOffset + 8);
    }
    // In most other browsers, "name/version" is at the end of userAgent 
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
      (verOffset = nAgt.lastIndexOf('/'))) {
      browserName = nAgt.substring(nameOffset, verOffset);
      fullVersion = nAgt.substring(verOffset + 1);
      if (browserName.toLowerCase() == browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) != -1)
      fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(" ")) != -1)
      fullVersion = fullVersion.substring(0, ix);

    majorVersion = parseInt('' + fullVersion, 10);
    if (isNaN(majorVersion)) {
      fullVersion = '' + parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion, 10);
    }

    return browserName + '-' + majorVersion;

  }

  /*
  * default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
