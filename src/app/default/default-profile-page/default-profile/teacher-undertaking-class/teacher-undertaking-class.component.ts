import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { RestAPIService, AuthenticationService } from 'src/app/_services';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-teacher-undertaking-class',
  templateUrl: './teacher-undertaking-class.component.html',
  styleUrls: ['./teacher-undertaking-class.component.scss']
})
export class TeacherUndertakingClassComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @Input() teacher_req_id;
  @Input() school_id;
  teacher_class_handled_array = new Array();
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
          obj.getTeacherUndertakingClassList();
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
 getTeacherUndertakingClassList(){
    if(this.teacher_req_id){
      this.restApiService.getData('classroomteacher/teacher/'+this.teacher_req_id,(classroom_teacher_response)=>{
        if(classroom_teacher_response && Array.isArray(classroom_teacher_response) && classroom_teacher_response.length>0){
          this.teacher_class_handled_array = [];
          classroom_teacher_response.forEach(element => {
            if(element.classRoom && element.classRoom.id){
              var check_id=this.teacher_class_handled_array.filter((details)=>{ return details.id == element.classRoom.id;});
              if(check_id.length==0){
                var classroom=[];
                classroom['id']=element.classRoom.id
                classroom['name'] = element.classRoom.name;
                if(element['defaultSnapId']){
                  this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      classroom['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  classroom['staticDpImg']='';
                }
                classroom['imgName']=(element.classRoom.name ? element.classRoom.name.slice(0,1) : '');
                this.teacher_class_handled_array.push(classroom);
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
