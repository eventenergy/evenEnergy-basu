import { Component, OnInit } from '@angular/core';
import {  AWS_DEFAULT_LINK } from '../../../config';
import { Router } from '@angular/router';
import { RestAPIService, DataService, AuthenticationService, AlertService } from '../../../_services';
import { HelperService } from '../../../_helpers';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-teacher-school-teachers',
  templateUrl: './teacher-school-teachers.component.html',
  styleUrls: ['./teacher-school-teachers.component.scss']
})
export class TeacherSchoolTeachersComponent implements OnInit {
  private unsubscribe$ = new Subject();
  school_id:number;
  school_teacher_array=new Array();
  
  constructor(
    private router:Router,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService
  ) { }

  /*
  * Angular default life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Organization Member' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          if(obj.dataService.hasSchoolId()){
            obj.school_id = obj.dataService.hasSchoolId();
            obj.getSchoolTeacherList();
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
  * To get School Teacher list
  */
  getSchoolTeacherList(){
    if(this.school_id){
      this.school_teacher_array=[];
      this.restApiService.getData('teacher/request/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.teacher && element.user && element.user.id && element.user.userProfile){
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