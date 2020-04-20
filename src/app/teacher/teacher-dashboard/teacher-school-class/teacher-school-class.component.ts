import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../../_services';
import { HelperService } from '../../../_helpers';
import { AWS_DEFAULT_LINK } from '../../../config';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-teacher-school-class',
  templateUrl: './teacher-school-class.component.html',
  styleUrls: ['./teacher-school-class.component.scss']
})
export class TeacherSchoolClassComponent implements OnInit {
  private unsubscribe$ = new Subject();
  class_list_array = new Array();
  school_teacher_array = new Array();
  teacher_class_handled_array = new Array();

  school_id:number;
  user_id:number;

  constructor(
    private router:Router,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService
  ){}
  
  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    this.alertService.setTitle( 'Organization Class' );//alert service for set title 

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
            if(this.dataService.hasSchoolId() && this.dataService.hasUserId()){
              this.school_id = this.dataService.hasSchoolId();
              this.user_id = this.dataService.hasUserId();
              this.getClassList();
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
    * Get Class List 
    */
    getClassList(){
      if(this.school_id){
        this.school_teacher_array=[];
        this.restApiService.getData('teacher/request/school/'+this.school_id,(response)=>{
          if(response && Array.isArray(response) && response.length>0){
            response.forEach(element => {
              if(element.teacher && element.user.id==this.user_id){
                var check_id=this.school_teacher_array.filter((details)=>{ return details.id === element.id; });
                if(check_id.length==0){
                  if(element.user.userProfile['defaultSnapId']){
                    this.restApiService.getData('snap/'+element.user.userProfile['defaultSnapId'],(snap_details_response)=>{
                      if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                        element.user.userProfile['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                      }
                    });
                  }else{
                    element.user.userProfile['staticDpImg']='';
                  }
                  this.school_teacher_array.push(element);
                }
              }
            });
            if(this.school_teacher_array && this.school_teacher_array.length>0){
              this.school_teacher_array.forEach(element => {
                if(element.id){
                  this.restApiService.getData('classroomteacher/teacher/'+element.id,(classteacher_response)=>{
                    if(classteacher_response && Array.isArray(classteacher_response) && classteacher_response.length>0){
                      classteacher_response.forEach(element => {
                        var check_id=this.teacher_class_handled_array.filter((details)=>{ return details.id === element.classRoom.id; });
                        if(check_id.length==0){
                          if(element.classRoom['defaultSnapId']){
                            this.restApiService.getData('snap/'+element.classRoom['defaultSnapId'],(snap_details_response)=>{
                              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                                element.classRoom['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                              }
                            });
                          }else{
                            element.classRoom['staticDpImg']='';
                          }
                          this.teacher_class_handled_array.push(element.classRoom);
                        }
                      });
                    }
                  });
                }
              });
            }
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
