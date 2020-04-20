import { Component, OnInit } from '@angular/core';
import { AWS_DEFAULT_LINK } from '../../../config';
import { Router } from '@angular/router';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../../_services';
import { HelperService } from '../../../_helpers';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-teacher-school-student',
  templateUrl: './teacher-school-student.component.html',
  styleUrls: ['./teacher-school-student.component.scss']
})
export class TeacherSchoolStudentComponent implements OnInit {
  private unsubscribe$ = new Subject();

  school_id:number;
  
  school_child_array=new Array();

  constructor(
    private router:Router,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService
  ) { }
  
  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    this.alertService.setTitle( 'Organization Student' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          if(obj.dataService.hasSchoolId()){
            obj.school_id = obj.dataService.hasSchoolId();
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
  * Function to return school children
  */
  getChildList(){
    if(this.school_id){
      this.school_child_array=[];
      this.restApiService.getData('parent/request/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.status && element.id){
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