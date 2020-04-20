import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { RestAPIService, AuthenticationService } from 'src/app/_services';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-student-parent',
  templateUrl: './student-parent.component.html',
  styleUrls: ['./student-parent.component.scss']
})
export class StudentParentComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @Input() school_id;
  @Input() child_id;
  parent_details_array = new Array();
  constructor(
    private restApiService: RestAPIService,
    private router:Router,
    private authenticateService: AuthenticationService,
    private helperService: HelperService,
  ) { }

  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          obj.showParentDetails();
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
  * Get teacher based on classroom
  */
  showParentDetails(){
    if(this.child_id){
      this.restApiService.getData('user/child/'+this.child_id,(child_profile_response)=>{
        if(child_profile_response && child_profile_response['id']){
          if(child_profile_response.users && Array.isArray(child_profile_response.users) && child_profile_response.users.length>0){
            this.parent_details_array = [];
            child_profile_response.users.forEach(element => {
              var check_parent_id=this.parent_details_array.filter((details)=>{ return details.id === element.id; });
              if(check_parent_id.length==0){
                if(element && element.id && element.userProfile){
                  var parent=[];
                  parent['id']=element.id;
                  parent['email']=element.email;
                  parent['firstName']=element.userProfile.firstName;
                  parent['lastName']=element.userProfile.lastName;
                  parent['mobile']=element.mobile;
                  if(element.userProfile['defaultSnapId']){
                    this.restApiService.getData('snap/'+element.userProfile['defaultSnapId'],(snap_details_response)=>{
                      if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                        parent['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
                      }
                    });
                  }else{
                    parent['staticDpImg']='';
                  }
                  parent['imgName']=((element.userProfile.firstName.slice(0,1))+(element.userProfile.lastName.slice(0,1)));
                  this.parent_details_array.push(parent);
                }
              }
            });
          }
        }
      });
    }
  }

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event){
    this.helperService.updateDefaultImageUrlHelper(event);
  }
  

  /*
  * default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
