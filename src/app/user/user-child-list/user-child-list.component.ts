import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from '../../config';
import { RestAPIService, AuthenticationService, AlertService } from '../../_services';
import { HelperService } from '../../_helpers';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-child-list',
  templateUrl: './user-child-list.component.html',
  styleUrls: ['./user-child-list.component.scss']
})
export class UserChildListComponent implements OnInit {
  private unsubscribe$ = new Subject();
  user_id:number;
  user_total_child_array=new Array();
  school_list_array=new Array();
  constructor(
    private router:Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService : HelperService,
    private alertService: AlertService,
  ){}

  /*
  * Default Angular life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Child List' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          this.user_id=response['user']['id'];
          if(this.user_id){
            this.getChildList();
          }
        }else{
          return obj.router.navigateByUrl('/login');
        }
      }else{
        if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
          obj.authenticateService.checkExpiryStatus();
        }
        return obj.router.navigateByUrl('/login');
      }
    });
  }
 
   /* 
   * To Get Child list 
   */
    getChildList(){
      if(this.user_id){
        this.restApiService.getData('user/childlist/'+this.user_id,(child_response)=>{
          if(child_response && Array.isArray(child_response) && child_response.length > 0){
            child_response.forEach(element => {
              var check_id=this.user_total_child_array.filter((details)=>{ return details.id === element.id});
              if(check_id.length==0){
                var child=[];
                child['id']=element.id;
                if(element['defaultSnapId']){
                  this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      child['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  child['staticDpImg']='';
                }
                child['firstName']=element.firstName;
                child['lastName']=element.lastName;
                child['dob']=element.dob;
                this.user_total_child_array.push(child);
              }
            });
          }
        });
      }
    }

  /*
  * Default Angular life cycle method
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

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event){
    this.helperService.updateDefaultImageUrlHelper(event);
  }


}
