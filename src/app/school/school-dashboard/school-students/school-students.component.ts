import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from '../../../config';
import { HelperService } from '../../../_helpers';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../../_services';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-school-students',
  templateUrl: './school-students.component.html',
  styleUrls: ['./school-students.component.scss']
})
export class SchoolStudentsComponent implements OnInit {
  private unsubscribe$ = new Subject();
  school_id:number;
  
  pending_child_array=new Array();
  school_child_array=new Array();

  constructor(
    private router:Router,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
  ) { }
  
  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          if(obj.dataService.hasSchoolId()){
            obj.school_id = obj.dataService.hasSchoolId();
            obj.getChildPendingRequestList();
            obj.getChildList();
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
  * Function to get parent child pending request
  */
  getChildPendingRequestList(){
    if(this.school_id){
      this.restApiService.getData('parent/request/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(!element.status){
              var check_id=this.pending_child_array.filter((details)=>{ return details.id === element.id; });
              if(check_id.length==0){
                if(element.child['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.child['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      element.child['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  element.child['staticDpImg']='';
                }
                this.pending_child_array.push(element);
              }
            }
          });
        }
      });
    }
  }
  
  /* 
  * Function to approve parent child pending request
  */
  approveChildRequest(child_id,school_id,index){
    if(child_id && school_id){
      if(this.school_id==school_id){
        this.restApiService.putAPI('parent/'+child_id+'/request/school/'+school_id+'/approve',{},(response)=>{
            if(response && response['id']){
              this.alertService.showAlertBottomNotification('Request Approved');
              this.getChildList();
              this.pending_child_array.splice(index, 1);
              this.authenticateService.pushUpdatedDetails();
            }else{
              this.alertService.showNotification('Something went wrong','error');
            }
        });
      }
    }
  }
  
  /* 
  * Function to reject parent child pending request
  */
  rejectChildRequest(user_id,school_id,index){
    if(user_id && school_id){
      if(this.school_id==school_id){
        this.restApiService.putAPI('parent/'+user_id+'/request/school/'+school_id+'/reject',{},(response)=>{
          if(response && response['success']){
            this.alertService.showAlertBottomNotification('Request Rejected');
            this.pending_child_array.splice(index, 1);
          }else{
            this.alertService.showNotification('Something went wrong','error');
          }
        });
      }
    }
  }
  
  /* 
  * Function to return school children
  */
  getChildList(){
    if(this.school_id){
      this.school_child_array=[];
      this.restApiService.getData('parent/request/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.status){
              var check_id=this.school_child_array.filter((details)=>{ return details.id === element.id; });
              if(check_id.length==0){
                if(element.child['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.child['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      element.child['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  element.child['staticDpImg']='';
                }
                this.school_child_array.push(element);
              }
            }
          });
        }
      });
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
