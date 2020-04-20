import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from '../../config';
import { RestAPIService, AuthenticationService, AlertService } from '../../_services';
import { HelperService } from '../../_helpers';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-invites',
  templateUrl: './user-invites.component.html',
  styleUrls: ['./user-invites.component.scss']
})
export class UserInvitesComponent implements OnInit {
  private unsubscribe$ = new Subject();
  user_id:number;
  child_request_details = new Array();

  school_teacher_request_details = new Array();

  school_list_array=new Array();

  user_total_child_array = new Array();
  family_invite_email:string='';
  family_invite_message:string='';
  family_invite_email_error_status:boolean = false;
  family_invite_email_error_message:string='';

  constructor(
    private router:Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService : HelperService,
    private alertService: AlertService,
  ){
  }

  /*
  * Default life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Invites' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          obj.user_id=response['user']['id'];
          obj.getAdminChildAddRequest();
          obj.getAdminTeacherInvites();
          obj.getChildList();
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
  * Admin added child request 
  */
  getAdminChildAddRequest(){
    if(this.user_id){
      this.child_request_details=[];
      this.restApiService.getData('childBind/getChildRequests/'+this.user_id,(response)=>{
        if(response && Array.isArray(response) && response.length > 0){
          response.forEach(element => {
            if(element && element.id && element.childProfile && element.childProfile.id){
              var check_id=this.child_request_details.filter((details)=>{ return details.id === element.id});
              if(check_id.length==0){
                var child_details=[];
                child_details['id']=element.id;
                child_details['child_id']=element.childProfile.id;
                child_details['firstName']=element.childProfile.firstName;
                child_details['lastName']=element.childProfile.lastName;
                child_details['Dob']=element.childProfile.Dob;
                child_details['male']=element.childProfile.male;
                if(element.childProfile['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.childProfile['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      child_details['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  child_details['staticDpImg']='';
                }
                child_details['school_name']=element.school && element.school.name ? element.school.name : '';
                child_details['school_website']=element.school && element.school.website ? element.school.website : '';
                this.child_request_details.push(child_details);
              }
            }
          });
        }
      });
    }
  }

  /* 
  * Admin Requested child accept by parent 
  */
  acceptChild(child_id){
    if(child_id){
      this.restApiService.putAPI('childBind/'+this.user_id+'/accept/'+child_id,{},(response)=>{
        if(response && response['id']){
          this.alertService.showAlertBottomNotification('Invite Accepted');
          setTimeout(()=>{this.getAdminChildAddRequest();},1000);
        }else if(response && response['message'] && !response['success']){
          this.alertService.showNotification('Something went wrong','error');
        }else{
          this.alertService.showNotification('Something went wrong','error');
        }
      });
    }
  }

  /* 
  * Admin Requested child rejected by parent 
  */
  rejectChild(child_id){
    if(child_id){
      this.restApiService.putAPI('childBind/'+this.user_id+'/reject/'+child_id,{},(response)=>{
        if(response && response['message'] && response['success']){
        this.alertService.showAlertBottomNotification('Invite Rejected');
        setTimeout(()=>{this.getAdminChildAddRequest();},1000);
        }else if(response && response['message'] && !response['success']){
        this.alertService.showNotification('Something went wrong','error');
        }else{
        this.alertService.showNotification('Something went wrong','error');
        }
      });
    }
  }

  /*
  * Admin sent teacher invite request
  */
  getAdminTeacherInvites(){
    if(this.user_id){
      this.school_teacher_request_details=[];
      this.restApiService.getData('schoolInvite/getTeacherInvites/'+this.user_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element && element.id && element.school && element.school.id){
              var check_id=this.school_teacher_request_details.filter((details)=>{ return details.id === element.id});
              if(check_id.length==0){
                var school_details=[];
                school_details['id']=element.id;
                school_details['registrationMessage']=element.registrationMessage;
                school_details['school_id']=element.school.id;
                school_details['school_name']=element.school.name;
                school_details['school_website']=element.school.website;
                if(element.school['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.school['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      school_details['staticSchoolDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  school_details['staticSchoolDpImg']='';
                }
                this.school_teacher_request_details.push(school_details);
              }
            }
          });
        }
      });
    }
  }

  /* 
  * Admin Requested child accept by parent 
  */
  acceptTeacherInvite(teacher_invite_id){
    if(teacher_invite_id && this.user_id){
      this.restApiService.putAPI('schoolInvite/'+this.user_id+'/accept/'+teacher_invite_id,{},(response)=>{
        if(response && response['id']){
          this.alertService.showAlertBottomNotification('Invite Accepted');
          setTimeout(()=>{this.getAdminTeacherInvites();},1000);
        }else if(response && response['message'] && !response['success']){
          this.alertService.showNotification('Something went wrong','error');
        }else{
          this.alertService.showNotification('Something went wrong','error');
        }
      });
    }
  }

  /* 
  * Admin Requested child rejected by parent 
  */
  rejectTeacherInvite(teacher_invite_id){
    if(teacher_invite_id && this.user_id){
      this.restApiService.putAPI('schoolInvite/'+this.user_id+'/reject/'+teacher_invite_id,{},(response)=>{
        if(response && response['message'] && response['success']){
          this.alertService.showAlertBottomNotification('Invite Rejected');
          setTimeout(()=>{this.getAdminTeacherInvites();},1000);
        }else if(response && response['message'] && !response['success']){
          this.alertService.showNotification('Something went wrong','error');
        }else{
          this.alertService.showNotification('Something went wrong','error');
        }
      });
    }
  }

  /*
  * Show invite family modal
  */
  showInviteFamilyModal(){
    if(this.user_total_child_array.length>0){
      var resetForm = <HTMLFormElement>document.getElementById('family_invite_form');
      if(resetForm)
        resetForm.reset();
      
      this.user_total_child_array.forEach(element => {
        element.isChecked = false;
      });
      
      this.family_invite_email_error_status = false;
      this.family_invite_email_error_message ='';
      $('#invite_family_modal').modal('show');
    }else{
      $('#user_invite_family_popup_to_restrict').modal('show');
    }
  }

  /*
  * Route to add child component
  */
  routeToAddChild(){
    $('#user_invite_family_popup_to_restrict').modal('hide');
    this.router.navigateByUrl('/user/child/add');
  }

  /*
  * Get Children list based on user
  */
  getChildList(){
    if(this.user_id){
      this.user_total_child_array=[];
      this.restApiService.getData('user/childlist/'+this.user_id,(child_response)=>{
        if(child_response && Array.isArray(child_response) && child_response.length > 0){
          child_response.forEach(element => {
            if(element && element.id){
              var check_id=this.user_total_child_array.filter((details)=>{ return details.id === element.id});
              if(check_id.length==0){
                var child=[];
                child['isChecked']=false;
                child['firstName']=element.firstName;
                child['lastName']=element.lastName;
                child['id']=element.id;
                if(element['defaultSnapId']){
                  this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      child['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  child['staticDpImg']='';
                }
                this.user_total_child_array.push(child);
              }
            }
          });
        }
      });
    }
  }

  /*
  * Select Children to register to school
  */
  selectChild(id) {
    var check_id=this.user_total_child_array.filter((details)=>{ return details.id === parseInt(id) && details.isChecked === true});
    if(check_id.length==0){
      var index_value= this.user_total_child_array.findIndex(obj => obj.id==parseInt(id));
      if(index_value>-1){
        if(typeof this.user_total_child_array[index_value] !== 'undefined') {
          this.user_total_child_array[index_value]['isChecked']=true;
        }
      }
    }else{
      var index_value= this.user_total_child_array.findIndex(obj => obj.id==parseInt(id));
      if(index_value>-1){
        if(typeof this.user_total_child_array[index_value] !== 'undefined') {
          this.user_total_child_array[index_value]['isChecked']=false;
        }
      }
    }
  }

  /*
  * Select Invite to family person
  */
  sendInviteToFamily(){
    this.family_invite_email_error_status = false;
    this.family_invite_email_error_message ='';
    if(!this.family_invite_email || (this.family_invite_email && !this.family_invite_email.trim())){
      this.family_invite_email_error_status = true;
      this.family_invite_email_error_message ='Email field is required';
      return false;
    }
    var email_pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
    if(this.family_invite_email && email_pattern.test(this.family_invite_email)){
      var child_selection_status:boolean=false;
      this.user_total_child_array.forEach(element => {
        if(element.isChecked){
          child_selection_status=true;
        }
      });
      if(child_selection_status){
        this.user_total_child_array.forEach(element => {
          if(element.isChecked){
            var childBind={
              "childProfile" : {
                "id": element.id
              },
              "parentEmailId" : this.family_invite_email.trim(),
              "requestDate" : new Date(),
            }
            this.restApiService.putAPI('childBind/requestChild',childBind,(response)=>{
              if(response && response['id']){
                $('#invite_family_modal').modal('hide');
                this.alertService.showAlertBottomNotification('Invite sent');
              }else if(response && !response['success']){
                this.alertService.showNotification('Something went wrong','error');
                return false;
              }else{
                this.alertService.showNotification('Something went wrong','error');
                return false;
              }
            });
          }
        });
      }else{
        this.alertService.showNotification('Please select atleast one child','error');
      }
    }else{
      this.family_invite_email_error_status = true;
      this.family_invite_email_error_message ='Email field is invalid';
      return false;
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
