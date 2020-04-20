import { Component, OnInit, Input } from '@angular/core';
import { RestAPIService, AuthenticationService } from 'src/app/_services';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-class-room-teacher',
  templateUrl: './class-room-teacher.component.html',
  styleUrls: ['./class-room-teacher.component.scss']
})
export class ClassRoomTeacherComponent implements OnInit {
    private unsubscribe$ = new Subject();
    @Input() class_id;
    @Input() school_id;
    class_teacher_array = new Array();
    constructor(
      private restApiService: RestAPIService,
      private router:Router,
      private authenticateService: AuthenticationService,
      private helperService: HelperService
    ) { }

  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          obj.getClassTeacher();
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
  getClassTeacher(){
    if(this.class_id){
      this.restApiService.getData('classroomteacher/class/'+this.class_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          this.class_teacher_array = [];
          response.forEach(element => {
            if(element.teacherUser && element.teacherUser.user && element.teacherUser.user.userProfile){
              var check_id=this.class_teacher_array.filter((details)=>{ return details.id === element.teacherUser.user.id && details.teacherUserId === element.teacherUser.id;});
              if(check_id.length==0){
                var teacher=[];
                teacher['teacherUserId']=element.teacherUser.id;
                teacher['id']=element.teacherUser.user.id;
                if(element.teacherUser.user.userProfile['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.teacherUser.user.userProfile['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      teacher['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  teacher['staticDpImg']='';
                }
                teacher['imgName']=((element.teacherUser.user.userProfile.firstName.slice(0,1))+(element.teacherUser.user.userProfile.lastName.slice(0,1)));
                teacher['email']=element.teacherUser.user.email;
                teacher['firstName']=element.teacherUser.user.userProfile.firstName;
                teacher['lastName']=element.teacherUser.user.userProfile.lastName;
                this.class_teacher_array.push(teacher);
              }
            }
          });
        }
      });
    }
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
