import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/takeUntil';
import { AlertService } from './_services';

@Component({
  selector: 'app-root',
  template: `<app-alert></app-alert><router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  constructor(
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    
    // console.log("Auth: ");
    // console.log(this._globalService.getAuthKey());//.subscribe(val=>console.log(val));
    /*this._globalService.auth$.subscribe(data => {
      console.log(data);
    }, error => {
      console.log('Error: ' + error);
    });*/
    // $(document).ready(function(){
    //   (<any>$('[data-toggle="tooltip"]')).tooltip();   
    // });
    //     document.addEventListener("click",function(e){
    //       if($('#logout')[0]){
    //           if(!document.getElementById('logout').contains(<Element>e.target)){
    //                $('#logout-div').hide();
    //            }
    //       }
    //   },false);
  }
  // onRefresh() {
  //   this.router.routeReuseStrategy.shouldReuseRoute = function(){return false;};
  
  //   let currentUrl = this.router.url + '?';
  //   this.router.navigateByUrl(currentUrl)
  //     .then(() => {
  //       console.log("lklkslkslkslks");
  //       this.router.navigated = false;
  //       this.router.navigate([this.router.url]);
  //     });
  //   }
  
}
