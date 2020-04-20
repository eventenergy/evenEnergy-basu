import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from '../../../config';
import { HelperService } from '../../../_helpers';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../../_services';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-school-admin',
  templateUrl: './school-admin.component.html',
  styleUrls: ['./school-admin.component.scss']
})
export class SchoolAdminComponent implements OnInit {
  private unsubscribe$ = new Subject();
  
  school_id:number;
  school_admin_array=new Array();
  pending_admin_array=new Array();
  adminEmail:string;

  constructor(
    private router:Router,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
  ) { }

  /*
  * Angular default life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Organization Admin' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          if(this.dataService.hasSchoolId()){
            this.school_id = this.dataService.hasSchoolId();
            obj.getadminPendingRequestList();
            obj.getSchooladminList();
          }else{
            return obj.router.navigate(['/login']);
          }
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
   * To get admin pending request for the school
   */
  getadminPendingRequestList(){
    if(this.school_id){
      this.restApiService.getData('user/admin/requests/bySchool/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(!element.admin){
              var check_id=this.pending_admin_array.filter((details)=>{ return details.id === element.id; });
              if(check_id.length==0){
                if(element.user.email && element.user.email.toString().length>15){
                  element.user.email= element.user.email.toString().substring(0,15)+' . .';
                }
                var adminEmail = element.user.email.substring(0, element.user.email.lastIndexOf("@"));
                if(element.user.userProfile.firstName){
                if(element.user.userProfile['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.user.userProfile['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      element.user.userProfile['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  element.user.userProfile['staticDpImg']='';
                }
              } else element.user.userProfile.firstName = adminEmail;
                this.pending_admin_array.push(element);
              }
            }
          });
        }
      });
    }
  }

  /*
  * To get School admin list
  */
  getSchooladminList(){
    this.alertService.showLoader();
    if(this.school_id){
      this.school_admin_array=[];
      this.restApiService.getData('user/admin/requests/bySchool/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.admin){
              var check_id=this.school_admin_array.filter((details)=>{ return details.id === element.id; });
              if(check_id.length==0){
                if(element.user.email && element.user.email.toString().length>15){
                  element.user.email= element.user.email.toString().substring(0,15)+' . .';
                }
                var adminEmail = element.user.email.substring(0, element.user.email.lastIndexOf("@"));
                if(element.user.userProfile.firstName){
                if(element.user.userProfile['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.user.userProfile['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      element.user.userProfile['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                 }else{ 
                   element.user.userProfile['staticDpImg']='';
                 }
                } else element.user.userProfile.firstName = adminEmail;
                this.school_admin_array.push(element);
              }
            }
          });
        }
        this.alertService.hideLoader();
      });
    }
  }

  /*
  * Approving admin request by admin
  */
  approveadminRequest(user_id,school_id,index){
    if(user_id && school_id){
      if(this.school_id==school_id){
        this.restApiService.putAPI('user/'+user_id+'/admin/school/'+school_id+'/approve',{},(response)=>{
          if(response && response['id']){
            this.alertService.showNotification('Request Approved','success');
            this.pending_admin_array.splice(index, 1);
            this.getSchooladminList();
          }else{
            this.alertService.showNotification('Something went wrong, please try again','error');
          }
        });
      }
    }
  }

  /*
  * Rejecting admin request by admin
  */
  rejectadminRequest(user_id,school_id,index){
    if(user_id && school_id){
      if(this.school_id==school_id){
        this.restApiService.putAPI('user/'+user_id+'/admin/school/'+school_id+'/remove',{},(response)=>{
          if(response && response['success']){
            this.alertService.showNotification('Request Rejected','success');
            this.pending_admin_array.splice(index, 1);
          }else{
            this.alertService.showNotification('Something went wrong, please try again','error');
          }
        });
      }
    }
  }

  /* 
  * Angular default life cycle method 
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }

  /*
  * default Angular Destroy Method
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
