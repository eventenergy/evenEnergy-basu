import { Component, OnInit, Input } from '@angular/core';
import { RestAPIService, AuthenticationService } from 'src/app/_services';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-class-room-student',
  templateUrl: './class-room-student.component.html',
  styleUrls: ['./class-room-student.component.scss']
})
export class ClassRoomStudentComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @Input() class_id;
  @Input() school_id;
  class_student_array = new Array();
  
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
          obj.getClassStudent();
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
  * Get student based on classroom
  */
  getClassStudent(){
    if(this.class_id){
      this.restApiService.getData('classroomstudent/class/'+this.class_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.childProfile){
              var check_id=this.class_student_array.filter((details)=>{ return details.id === element.childProfile.id;});
              if(check_id.length==0){
                var student=[];
                student['id']=element.childProfile.id;
                if(element.childProfile['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.childProfile['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      student['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  student['staticDpImg']='';
                }
                student['imgName']=((element.childProfile.firstName.slice(0,1))+(element.childProfile.lastName.slice(0,1)));
                student['firstName']=element.childProfile.firstName;
                student['lastName']=element.childProfile.lastName;
                student['dob'] = element.childProfile.Dob;
                this.class_student_array.push(student);
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
