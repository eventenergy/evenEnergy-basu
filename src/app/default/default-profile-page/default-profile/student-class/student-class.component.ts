import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { RestAPIService, AuthenticationService } from 'src/app/_services';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-student-class',
  templateUrl: './student-class.component.html',
  styleUrls: ['./student-class.component.scss']
})
export class StudentClassComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @Input() child_id;
  @Input() school_id;
  student_class_array = new Array();
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
          obj.getStudentClassList();
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
  * Function to get student class list
  */
  getStudentClassList(){
    if(this.child_id){
      this.restApiService.getData('classroomstudent/student/'+this.child_id,(classroom_student_response)=>{
        if(classroom_student_response && Array.isArray(classroom_student_response) && classroom_student_response.length>0){
          this.student_class_array = [];
          classroom_student_response.forEach(element => {
            if(element.classRoom && element.classRoom.id){
              var check_id=this.student_class_array.filter((details)=>{ return details.id == element.classRoom.id;});
              if(check_id.length==0){
                var classroom=[];
                classroom['id']=element.classRoom.id
                classroom['name'] = element.classRoom.name;
                if(element['defaultSnapId']){
                  this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      classroom['staticDpImg'] = AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  classroom['staticDpImg']='';
                }
                classroom['imgName']=(element.classRoom.name ? element.classRoom.name.slice(0,1) : '');
                this.student_class_array.push(classroom);
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
