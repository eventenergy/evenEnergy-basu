import { Component, OnInit, Input } from '@angular/core';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { Subject } from 'rxjs';
import { RestAPIService, AuthenticationService, AlertService } from 'src/app/_services';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-user-child-school',
  templateUrl: './user-child-school.component.html',
  styleUrls: ['./user-child-school.component.scss']
})
export class UserChildSchoolComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @Input() child_id;
  student_school_array = new Array();
  
  constructor(
    private restApiService: RestAPIService,
    private router:Router,
    private authenticateService: AuthenticationService,
    private helperService: HelperService,
    private alertService: AlertService,
  ){ }

  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    this.alertService.setTitle( 'Child Organization' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          obj.getStudentSchoolDetails();
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
  * Get student school details
  */
  getStudentSchoolDetails(){
    if(this.child_id){
      this.restApiService.getData('child/schoolsBy/'+this.child_id,(child_school_response)=>{
        this.student_school_array = [];
        if(child_school_response && Array.isArray(child_school_response) && child_school_response.length>0){
          child_school_response.forEach(element => {
            if(element && element.id){
              var check_id=this.student_school_array.filter((details)=>{ return details.id === element.id;});
              if(check_id.length==0){
                var school=[];
                school['id']=element.id;
                school['name'] = element.name;
                if(element['defaultSnapId']){
                  this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      school['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  school['staticDpImg']='';
                }
                school['imgName']=(element.name ? element.name.slice(0,1) : '');
                school['email'] = (element.emailAddress ? (element.emailAddress.length>16 ? element.emailAddress.slice(0,16)+".." : element.emailAddress.slice(0,16)) : '');
                school['website'] = element.website;
                this.student_school_array.push(school);
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