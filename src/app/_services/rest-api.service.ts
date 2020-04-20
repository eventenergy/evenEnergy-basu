import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL_LINK,CLIENT_ID,CLIENT_SECRET } from '../config';
import { Router } from '@angular/router';
import { Subject, timer, merge, Observable, throwError } from 'rxjs';
import { AlertService } from './alert.service';
import { first, map } from 'rxjs/operators';
import {CookieService} from 'ngx-cookie-service';
// import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class RestAPIService {
    hostURL = API_URL_LINK;
    private unsubscribe$ = new Subject();

    constructor(
        private http: HttpClient,
        private router: Router,
        private alertService: AlertService,
        // private authService: AuthenticationService,
        private cookie: CookieService
        
    ) { }

    /*
    * Function to get header data
    */
    getHeader() {
        let auth;
        if (localStorage.getItem('MyApp_Auth'))
            auth = localStorage.getItem('MyApp_Auth');
        return auth;
    }

    /*
    * Function to get header data
    */
    getBearerHeader() {
        const scope = this;
       // tslint:disable-next-line: align
    //    if(!this.cookie.check("access_token")){
    //        if(!this.cookie.check("refresh_token")){
    //             return this.router.navigateByUrl('/login');
    //         }
    //        return  this.refreshToken(this.getBearerHeaderCallBack, scope);      //    getBearerHeaderCallBack;
    //    }
    //    // tslint:disable-next-line: align

    if(!this.cookie.check("access_token")){
        // return undefined;
        var cred: any = 
        {'Content-type': 'application/json',
        // tslint:disable-next-line: object-literal-key-quotes
        // 'Authorization': 'Bearer '+accessToken,
        accept : 'application/json',
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials':'true',
                withCredentials:'true',
                deviceId:this.generateDeviceId(),
                clientId:CLIENT_ID,
                "X-Requested-With":'XMLHttpRequest'
        };

        return cred;
    }
       return this.getBearerHeaderCallBack(scope);
    
    // // this.cookie.get("refresh_token")
    }
    getBearerHeaderCallBack(scope){

        var accessToken = scope.cookie.get("access_token");
        var cred = 
    {'Content-type': 'application/json',
    // tslint:disable-next-line: object-literal-key-quotes
    'Authorization': 'Bearer '+accessToken,
    accept : 'application/json',
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':'true',
            withCredentials:'true',
            deviceId:this.generateDeviceId(),
            clientId:CLIENT_ID,
            "X-Requested-With":'XMLHttpRequest'
    };
        return cred;
    }

    // async refreshToken(callback,scope){
    //     let params = new URLSearchParams();
    //     params.append('refresh_token',this.cookie.get('refresh_token'));
    //     params.append('grant_type','refresh_token');
    //     // params.append('client_id','fooClientIdPassword');
    //     console.log("client details: "+CLIENT_ID+":"+CLIENT_SECRET);
    //     var cred = 
    //     {'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
    //     'Authorization': 'Basic '+btoa(CLIENT_ID+":"+CLIENT_SECRET),
    //     accept : 'application/json',
    //             'Access-Control-Allow-Origin':'*',
    //             'Access-Control-Allow-Credentials':'true',
    //             withCredentials:'true'
    //   } ;
    //     let headers = 
    //       new HttpHeaders(cred);
    //     // let options = new RequestOptions({ headers: headers });
         
    //     this.http.post(API_URL_LINK+'oauth/token', 
    //       params.toString(), {headers:headers}).takeUntil(this.unsubscribe$).subscribe((response:any) => {
    //         console.log("response: "+response);
    //         if(response){
    //           localStorage.setItem('MyApp_Auth', JSON.stringify(cred));
    //           // localStorage.setItem('loggedUser',JSON.stringify(response));
    //           this.saveToken(response);
    //           return callback && callback(scope);
    //                     // this.registerDevice(loginData,returnUrl);
    //         }
    //       },
    //         (err) => {
    //           this.alertService.hideLoader();
    //           localStorage.clear();
    //           this.cookie.delete('access_token');
    //           this.cookie.delete('refresh_token');
    //           // if(err){
    //           //   error.
    //           // }
    //           // this.alertService.showAlertBottomNotification('Username or password wrong');
    //           this.alertService.showNotification('Access has been exipired. PLease login again','error');
    //           return this.router.navigateByUrl('/login');
    //           // this.alertService.showNotification('Something went wrong when logging you in, Please try again later');
    //         }
    //           ); 
    //   } 
    //   saveToken(token){
    //     var expireDate = new Date().getTime() + (1000 * token.expires_in);
    //     this.cookie.set("access_token", token.access_token, new Date(expireDate));
    //     this.cookie.set("refresh_token", token.refresh_token, new Date((expireDate*2)));
    //     this.cookie.set("expires_in", token.expires_in);
    //     // this.router.navigate(['/']);
    //   }
    generateDeviceId(){
        if(this.cookie.check('e_device_id')){
            return this.cookie.get('e_device_id');
        }
        const length = 25;
        var id = '';
        id += this.getClientOS();
        id += '-'
        id += this.getClientBrowser();
        id += '-'
        var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for(; id.length<=length;){
          id += str.charAt(Math.floor(Math.random()*str.length)); 
        }
        console.log(id);
        this.cookie.set('e_device_id',id);
        return id;
      }

      getClientOS(){
        if (navigator.appVersion.indexOf("Win") != -1) return "Windows"; 
        if (navigator.appVersion.indexOf("Mac") != -1) return "Mac"; 
        if (navigator.appVersion.indexOf("X11") != -1) return "UNIX"; 
        if (navigator.appVersion.indexOf("Linux") != -1) return "Linux";
        if (navigator.userAgent.indexOf("Android") != -1) return "Android"; 
        if (navigator.userAgent.indexOf("like Mac") != -1) return "iOS"; 
        return ""; 
  }

  getClientBrowser(){
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName  = navigator.appName;
    var fullVersion  = ''+parseFloat(navigator.appVersion); 
    var majorVersion = parseInt(navigator.appVersion,10);
    var nameOffset,verOffset,ix;
    
    // In Opera 15+, the true version is after "OPR/" 
    if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
     browserName = "Opera";
     fullVersion = nAgt.substring(verOffset+4);
    }
    // In older Opera, the true version is after "Opera" or after "Version"
    else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
     browserName = "Opera";
     fullVersion = nAgt.substring(verOffset+6);
     if ((verOffset=nAgt.indexOf("Version"))!=-1) 
       fullVersion = nAgt.substring(verOffset+8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
     browserName = "Microsoft Internet Explorer";
     fullVersion = nAgt.substring(verOffset+5);
    }
    // In Chrome, the true version is after "Chrome" 
    else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
     browserName = "Chrome";
     fullVersion = nAgt.substring(verOffset+7);
    }
    // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
     browserName = "Safari";
     fullVersion = nAgt.substring(verOffset+7);
     if ((verOffset=nAgt.indexOf("Version"))!=-1) 
       fullVersion = nAgt.substring(verOffset+8);
    }
    // In Firefox, the true version is after "Firefox" 
    else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
     browserName = "Firefox";
     fullVersion = nAgt.substring(verOffset+8);
    }
    // In most other browsers, "name/version" is at the end of userAgent 
    else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
              (verOffset=nAgt.lastIndexOf('/')) ) 
    {
     browserName = nAgt.substring(nameOffset,verOffset);
     fullVersion = nAgt.substring(verOffset+1);
     if (browserName.toLowerCase()==browserName.toUpperCase()) {
      browserName = navigator.appName;
     }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix=fullVersion.indexOf(";"))!=-1)
       fullVersion=fullVersion.substring(0,ix);
    if ((ix=fullVersion.indexOf(" "))!=-1)
       fullVersion=fullVersion.substring(0,ix);
    
    majorVersion = parseInt(''+fullVersion,10);
    if (isNaN(majorVersion)) {
     fullVersion  = ''+parseFloat(navigator.appVersion); 
     majorVersion = parseInt(navigator.appVersion,10);
    }

    return browserName+'-'+ majorVersion;
    
  }


    /*
    * Rest API Function to get data based on url
    */
    async getData(url, callback, errorCallBack = null, timeout = null) {
        url = this.hostURL + url;
        // let cred = this.getHeader() ? JSON.parse(this.getHeader()) : {};
        // let cred:any =  this.getBearerHeader();
        // if(!cred){
        //     cred = {
        //         "X-Requested-With":'XMLHttpRequest'
        //     }
        // }
        // // const headers = new HttpHeaders(cred); basic Auth
        // const headers = new HttpHeaders(cred); //Oauth2
        // var getObs$ = this.http.get(url, { headers: headers });
        var getObs$ = this.http.get(url);
        var timer$;
        if (timeout) {
            console.log('timeout value set to: ' + timeout);
            timer$ = timer(timeout).pipe(first(), map((time) => {
                throw new Error('Timed out, passed ' + timeout + " sec");
            }));
        }
        var finalObs$ = timeout ? merge(getObs$, timer$) : getObs$;

        finalObs$.pipe(first()).subscribe((response) => {
            return callback && callback(response);
        }, 
        error => {
            if (errorCallBack && typeof (errorCallBack) == 'function') errorCallBack();
            this.alertService.hideLoader();
            if (error && error.status && (error.status == 404)) {
                // return this.router.navigateByUrl('/page-not-found');
            }
            console.log('error in the restapi serv at '+ url, error);
        });
    }

    /*
    * Rest API Function to save file to storage using form data object
    */
    async pushSaveFileToStorage(file, url, callback) {
        url = this.hostURL + url;
        let formdata = new FormData();
        formdata.append('imgFile', file);
        // let cred = this.getHeader() ? JSON.parse(this.getHeader()) : {};
        let cred:any =  this.getBearerHeader();
        if(!cred){
            cred = {
                "X-Requested-With":'XMLHttpRequest'
            }
        }
        // const headers = new HttpHeaders(cred); basic Auth
        const headers = new HttpHeaders(cred); //Oauth2
        headers.append('Content-Type', 'application/form-data');
        // reportProgress: true,observe: 'events'
        await this.http.post(url, formdata, { headers: headers }).takeUntil(this.unsubscribe$).subscribe(
            (data) => {
                return callback && callback(data);
            }, error => {
                this.alertService.hideLoader();
                console.log(error);
            }
        );
    }

    /*
    * Rest API Function to save file to storage using get form data object
    */
    async pushSaveFileToStorageWithFormdata(formdata, url, callback) {
        url = this.hostURL + url;
        // let cred = this.getHeader() ? JSON.parse(this.getHeader()) : {};
        let cred:any =  this.getBearerHeader();//Oauth2
        if(!cred){
            cred = {
                "X-Requested-With":'XMLHttpRequest'
            }
        }
        // const headers = new HttpHeaders(cred); basic Auth
        const headers = new HttpHeaders(cred); //Oauth2
        headers.append('Content-Type', 'application/form-data');
        await this.http.post(url, formdata, { headers: headers }).takeUntil(this.unsubscribe$).subscribe(
            (data) => {
                return callback && callback(data);
            }, error => {
                this.alertService.hideLoader();
                console.log(error);
            }
        );
    }

    /*
    * Rest API Function to post some data
    */
    async postAPI(url, data, callback, errorCallBack=undefined) {
        url = this.hostURL + url;
        // let cred = this.getHeader() ? JSON.parse(this.getHeader()) : {};
        let cred:any =  this.getBearerHeader();//Oauth2
        if(!cred){
            cred = {
                "X-Requested-With":'XMLHttpRequest'
            }
        }
        // const headers = new HttpHeaders(cred); basic Auth
        const headers = new HttpHeaders(cred); //Oauth2
        await this.http.post(url, data, { headers: headers }).pipe(first()).takeUntil(this.unsubscribe$).subscribe(response => {
            return callback && callback(response);
        }, error => {
            this.alertService.hideLoader();
            if(errorCallBack) errorCallBack(error);
            if (error.error) {
                this.alertService.showNotification('Something went wrong, please try again', 'error');
            } else {
                this.alertService.showNotification('Something went wrong, please try again', 'error');
            }
        });
    }

    /*
    * Rest API Function to PUT some data
    */
    async putAPI(url, data, callback) {
        url = this.hostURL + url;
        // let cred = this.getHeader() ? JSON.parse(this.getHeader()) : {};
        let cred:any =  this.getBearerHeader();//Oauth2
        if(!cred){
            cred = {
                "X-Requested-With":'XMLHttpRequest'
            }
        }
        // const headers = new HttpHeaders(cred); basic Auth
        const headers = new HttpHeaders(cred); //Oauth2
        await this.http.put(url, data, { headers: headers }).takeUntil(this.unsubscribe$).subscribe(response => {
            return callback && callback(response);
        }, error => {
            this.alertService.hideLoader();
            if (error.error) {
                this.alertService.showNotification('Something went wrong, please try again', 'error');
            } else {
                this.alertService.showNotification('Something went wrong, please try again', 'error');
            }
        });
    }

    /*
    * Rest API Function to Delete
    */
    async deleteAPI(url, callback) {
        url = this.hostURL + url;
        // let cred = this.getHeader() ? JSON.parse(this.getHeader()) : {};
        let cred:any =  this.getBearerHeader();//Oauth2
        if(!cred){
            cred = {
                "X-Requested-With":'XMLHttpRequest'
            }
        }
        // const headers = new HttpHeaders(cred); basic Auth
        const headers = new HttpHeaders(cred); //Oauth2
        await this.http.delete(url, { headers: headers }).takeUntil(this.unsubscribe$).subscribe(response => {
            return callback && callback(response);
        }, error => {
            this.alertService.hideLoader();
            if (error.status == 200) {
                return callback && callback({ 'msg': 'success' });
            } else {
                this.alertService.showNotification('Something went wrong, please try again', 'error');
                return callback && callback({ 'msg': 'fail' });
            }
        });
    }

    /*
    * Function to get logged user details
    */
    getOfflineLoggedUserDetails() {
        if (localStorage.getItem('loggedUser')) {
            var user_details = JSON.parse(localStorage.getItem('loggedUser'));
            return user_details;
        }
        return [];
    }

    /*
    * Function to Download file
    */
    async downloadFile(url, callback) {
        // let cred = this.getHeader() ? JSON.parse(this.getHeader()) : {};
        let cred:any =  this.getBearerHeader();//Oauth2
        if(!cred){
            cred = {
                "X-Requested-With":'XMLHttpRequest'
            }
        }
        // const headers = new HttpHeaders(cred); basic Auth
        const headers = new HttpHeaders(cred); //Oauth2
        await this.http.get(url, { headers: headers, responseType: 'blob' }).takeUntil(this.unsubscribe$).subscribe((response) => {
            return callback && callback(response);
        }, error => {
            this.alertService.hideLoader();
            this.alertService.showNotification('Something went wrong, please try again', 'error');
        });
    }

    /*
    * Function to Download AWS file
    */
    async downloadAWSFile(url, callback) {
        // let cred = this.getHeader() ? JSON.parse(this.getHeader()) : {};
        // console.log(cred);
        await this.http.get(this.hostURL + url, { responseType: 'blob' }).takeUntil(this.unsubscribe$).subscribe((response) => {
            return callback && callback(response);
        }, error => {
            this.alertService.hideLoader();
            this.alertService.showNotification('Something went wrong, please try again', 'error');
        });
    }

    downLoadFile(data: any, type: string) {
        let blob = new Blob([data], { type: type});
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'download'+this.getFileExtention(type);
        a.click();

        // let pwa = window.open(url);
        // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        //     alert( 'Please disable your Pop-up blocker and try again.');
        // }
    }

    getFileExtention(type: string){
        switch (type) {
            case 'application/ms-excel':
                return '.xlsx';
            default:
                return '';
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
