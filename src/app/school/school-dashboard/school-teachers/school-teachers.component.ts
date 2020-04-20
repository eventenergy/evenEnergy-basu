import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from '../../../config';
import { HelperService } from '../../../_helpers';
import { AuthenticationService, RestAPIService, DataService, AlertService } from '../../../_services';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-school-teachers',
  templateUrl: './school-teachers.component.html',
  styleUrls: ['./school-teachers.component.scss']
})
export class SchoolTeachersComponent implements OnInit {
  private unsubscribe$ = new Subject();
  school_id:number;
  school_teacher_array=new Array();
  pending_teacher_array=new Array();
  userEmail:string;
  EmailName:string;
  loggedUserName:string;
  teacherInviteEmail:string='';
  teacherInviteRegistrationMessage:string='';
  loggedUserStaticDpImg: string = '';
  @ViewChild('teacherInviteModal') teacherInviteModal:ElementRef;
  
  constructor(
    private router:Router,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
    private elementRef: ElementRef,
  ) { }

  /*
  * Angular default life cycle method
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          if(obj.dataService.hasSchoolId()){
            obj.school_id = obj.dataService.hasSchoolId();
            obj.getTeacherPendingRequestList();
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
  * To get teacher pending request for the school
  */
  getTeacherPendingRequestList(){
    this.alertService.showLoader();
    if(this.school_id){
      this.restApiService.getData('teacher/request/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(!element.teacher){
              var check_id=this.pending_teacher_array.filter((details)=>{ return details.id === element.id; });
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
                this.pending_teacher_array.push(element);
              }
            }
          });
        }
        this.alertService.hideLoader();
      });
    }
  }

  /*
  * To get School Teacher list
  */
  getSchoolTeacherList(){
    // var list=this;
    if(this.school_id){
      this.school_teacher_array=[];
      this.restApiService.getData('teacher/request/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.teacher && element.user && element.user.id && element.user.userProfile){
              var check_id=this.school_teacher_array.filter((details)=>{ return details.id === element.id; });
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
                this.school_teacher_array.push(element);
              }
            }
          });
        }
      });
    }
  }

  /*
  * Approving teacher request by admin
  */
  approveTeacherRequest(user_id,school_id,index){
    if(user_id && school_id){
      if(this.school_id==school_id){
        this.restApiService.putAPI('teacher/'+user_id+'/request/school/'+school_id+'/approve',{},(response)=>{
          if(response && response['id']){
            this.alertService.showNotification('Request Approved');
            this.pending_teacher_array.splice(index, 1);
            this.getSchoolTeacherList();
          }else{
            this.alertService.showNotification('Something went wrong, please try again','error');
          }
        });
      }
    }
  }

  /*
  * Rejecting teacher request by admin
  */
  rejectTeacherRequest(user_id,school_id,index){
    if(user_id && school_id){
      if(this.school_id==school_id){
        this.restApiService.putAPI('teacher/'+user_id+'/request/school/'+school_id+'/reject',{},(response)=>{
          if(response && response['success']){
            this.alertService.showAlertBottomNotification('Request Rejected');
            this.pending_teacher_array.splice(index, 1);
          }else{
            this.alertService.showNotification('Something went wrong, please try again','error');
          }
        });
      }
    }
  }

  /*
  *  open Teacher invite Modal popup
  */
  openTeacherInviteModal(){
    (<HTMLFormElement>document.getElementById("teacher_invite_form")).reset();
    $(this.teacherInviteModal.nativeElement).modal('show');
  }

  /*
  * Function to Send teacher invite 
  */
  sendTeacherInvite(){
    if(this.teacherInviteEmail && this.teacherInviteEmail.toString().trim()){
      var email_pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
      if(this.teacherInviteEmail && this.teacherInviteEmail.toString().trim() && email_pattern.test(this.teacherInviteEmail.toString().trim())){
        var teacher_invite={
          "userEmailId":this.teacherInviteEmail.trim(),
          "registrationMessage": (this.teacherInviteRegistrationMessage ? this.teacherInviteRegistrationMessage.toString().trim() : ''),
          "school":{
            "id": this.school_id,
          },
          "requestDate": new Date(),
        }
        this.restApiService.postAPI('schoolInvite/teacher',teacher_invite,(response)=>{
          if(response && response['id']){
            this.alertService.showAlertBottomNotification('Member Invited');
            $(this.teacherInviteModal.nativeElement).modal('hide');
          }else if(response && !response['success']){
            this.alertService.showNotification('Something went wrong, please try again','error');
          }else{
            this.alertService.showNotification('Something went wrong, please try again','error');
          }
        });
      }
    }else{
      this.alertService.showNotification('Email Id is required','error');
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
