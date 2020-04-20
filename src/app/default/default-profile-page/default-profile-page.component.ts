import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService, DataService } from 'src/app/_services';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-default-profile-page',
  templateUrl: './default-profile-page.component.html',
  styleUrls: ['./default-profile-page.component.scss']
})
export class DefaultProfilePageComponent implements OnInit {
  private unsubscribe$ = new Subject();

  constructor(
    private dataService: DataService,
    private helperService: HelperService,
    private router: Router,
    private authenticateService: AuthenticationService,
  ) { }

  /* 
  * Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          // obj.dataService.getRole.takeUntil(this.unsubscribe$).subscribe((role_response)=>{
          //   let roles_name = ['ADMIN', 'TEACHER', 'PARENT'];
          //   var index_value= roles_name.findIndex(obj => obj == role_response);
          //   if(index_value == -1){
          //     return this.helperService.goBack();
          //   }
          // });
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
  * Angular default life cycle method 
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }
  /*
  * Default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
