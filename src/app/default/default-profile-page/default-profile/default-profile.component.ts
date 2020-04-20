import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router} from '@angular/router';
import { HelperService } from 'src/app/_helpers';
import { RestAPIService, AuthenticationService, DataService, AlertService } from 'src/app/_services';
import { AWS_DEFAULT_LINK } from 'src/app/config';

@Component({
  selector: 'app-default-profile',
  templateUrl: './default-profile.component.html',
  styleUrls: ['./default-profile.component.scss']
})
export class DefaultProfileComponent implements OnInit {
  private unsubscribe$ = new Subject();
  default_id:number;
  teacher_req_id:number;
  school_id:number;
  child_req_id:number;
  school_name:string;
  default_details:any;
  selected_role:string;
  component_array = new Array();
  profileName:string;
  EmailName:string;
  staticName:string;
  textemail:string;

  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
  ) {
    if(this.router.url){
      const urlTree = this.router.parseUrl(this.router.url);
      if(urlTree){
        this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
          if(params && params['id'] && parseInt(params['id'])){
            this.default_id=parseInt(params['id']);
            this.dataService.getSchoolId.takeUntil(this.unsubscribe$).subscribe(school_id_response => {
              if(school_id_response){
                this.school_id = school_id_response;
                this.authenticateService.getSelectedSchoolDetails((school_details)=>{
                  if(school_details && school_details.school_name){
                    this.school_name = school_details.school_name;
                  }
                });
                this.dataService.getRole.takeUntil(this.unsubscribe$).subscribe(role_response => {
                  console.log(role_response);
                  console.log("hihihiihih");
                  if(role_response){
                    this.selected_role = role_response;
                    if(urlTree.root && urlTree.root.children && urlTree.root.children['primary']){
                      const urlWithoutParams = urlTree.root.children['primary'].segments.map(it => it.path).join('/');
                      if(urlWithoutParams=='admin/organization/class-room/profile' || urlWithoutParams=='member/organization/class-room/profile'){
                        this.showClassRoomDetails();
                      }else if(urlWithoutParams=='admin/organization/member-profile' || urlWithoutParams=='member/organization/member-profile'){
                        if(params['t_req_id'] && parseInt(params['t_req_id'])){
                          this.teacher_req_id = parseInt(params['t_req_id']);
                          this.showTeacherProfileDetails();
                        }else{
                          this.helperService.goBack();
                        }
                      }else if(urlWithoutParams=='admin/organization/student-profile' || urlWithoutParams=='member/organization/student-profile'){
                          if(params['c_req_id'] && parseInt(params['c_req_id'])){
                            this.child_req_id = parseInt(params['c_req_id']);
                            this.showChildProfileDetails();
                          }else{
                            this.helperService.goBack();
                          }
                      }else if(urlWithoutParams == 'admin/organization/admin-profile'){
                        this.showAdminProfileDetails();
                      }else if(urlWithoutParams == 'user/organization/profile'){
                        this.showSchoolProfileDetails();
                      }else{
                        this.helperService.goBack();
                      }
                    }
                  }else{
                    this.helperService.goBack();
                  }
                });
              }else{
                this.helperService.goBack();
              }
            });
          }else{
            this.helperService.goBack();
          }
        });
      }
    }else{
      this.helperService.goBack();
    }
  }

  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          
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
  * Get class based on class Id
  */
  showClassRoomDetails(){
    if(this.default_id && this.school_id){
      this.restApiService.getData('classroom/'+this.default_id,(response)=>{
        if(response && response['id']){
          this.default_details = [];
          this.default_details['name'] = response.name;
          this.default_details['id'] = response.id;
          if(response['defaultSnapId']){
            this.restApiService.getData('snap/'+response['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                this.default_details['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
              }
            });
          }else{
            this.default_details['staticDpImg']='';
          }
          this.default_details['imgName'] = (response.name ? response.name.slice(0,1) : '');
          this.default_details['editPermission']=false;
          if(this.selected_role == 'ADMIN'){
            this.default_details['editPermission']=true;
            this.default_details['route_url']='/admin/school/class-room?type=edit&id='+response.id;
          }
          this.component_array = [];
          this.component_array.push({name:'Event Subscribers', active: true, id:'classroom_teacher'});
          this.component_array.push({name:"Event Performers", active: false, id:'classroom_student'});
        }else{
          return this.helperService.goBack();
        }
      });
    }else{
      return this.helperService.goBack();
    }
  }

  /* 
  * Function to show teacher profile details
  */
  showTeacherProfileDetails(){
    if(this.default_id && this.school_id && this.teacher_req_id){
      this.restApiService.getData('user/'+this.default_id,(teacher_profile_response)=>{
        // console.log(teacher_profile_response);
        if(teacher_profile_response && teacher_profile_response['id'] && teacher_profile_response.userProfile){
          this.default_details = [];
          this.default_details['name'] = teacher_profile_response.userProfile.firstName +" "+teacher_profile_response.userProfile.lastName;
          this.default_details['email'] = teacher_profile_response.email;
          var EmailName = this.default_details['email'].substring(0, this.default_details['email'].lastIndexOf("@"));
          this.default_details['id'] = teacher_profile_response.id;
          if(teacher_profile_response.userProfile.firstName) {
          this.profileName = teacher_profile_response.userProfile.firstName +" "+teacher_profile_response.userProfile.lastName;
          if(teacher_profile_response.userProfile['defaultSnapId']){
            this.restApiService.getData('snap/'+teacher_profile_response.userProfile['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                this.default_details['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
              }
            });
          }
          else{
            this.default_details['staticDpImg']='';
          }
        } 
        else 
        this.profileName = EmailName;

          // this.default_details['imgName'] = teacher_profile_response.userProfile.firstName ? teacher_profile_response.userProfile.firstName.slice(0,1) : '' + teacher_profile_response.userProfile.lastName ? teacher_profile_response.userProfile.lastName.slice(0,1) : '';
        //   if(this.default_details['imgName']) {
        //     this.staticName = this.default_details['imgName'];
        //   } else this.staticName = textemail;
        //   var textemail = teacher_profile_response.email ? teacher_profile_response.email.slice(0,1) : '';
        //  console.log(this.staticName);
        //  console.log('hihfighaifhaifhaifhisfjifh');
          // if(teacher_profile_response.userProfile.firstName) {
          //   this.staticName = teacher_profile_response.userProfile.firstName ? teacher_profile_response.userProfile.firstName.slice(0,1) : '') + (teacher_profile_response.userProfile.lastName ? teacher_profile_response.userProfile.lastName.slice(0,1) : '');
          // } else this.staticName = textemail;
         
         
          this.default_details['editPermission']=false;
          this.component_array = [];
          // this.component_array.push({name:'Event', active: true, id:'teacher_class'});
          this.component_array.push({name:'About', active: true, id:'teacher_about'});
        }
      });
    }
  }

  /* 
  * Function to show child profile details
  */
  showChildProfileDetails(){
    if(this.default_id && this.child_req_id){
      this.restApiService.getData('user/child/'+this.default_id,(child_profile_response)=>{
        if(child_profile_response && child_profile_response['id']){
          this.default_details = [];
          this.default_details['name'] = child_profile_response.firstName +" "+child_profile_response.lastName;
          this.default_details['id'] = child_profile_response.id;
          if(child_profile_response['defaultSnapId']){
            this.restApiService.getData('snap/'+child_profile_response['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                this.default_details['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
              }
            });
          }else{
            this.default_details['staticDpImg']='';
          }
          this.default_details['imgName'] = (child_profile_response.firstName ? child_profile_response.firstName.slice(0,1) : '') + (child_profile_response.lastName ? child_profile_response.lastName.slice(0,1) : '');
          this.default_details['editPermission']=true;
          this.default_details['route_url']='/admin/school/student-profile/edit/'+child_profile_response.id;
          this.default_details['dob'] = child_profile_response.Dob;
          this.component_array = [];
          // this.component_array.push({name:'Parent', active: true, id:'child_parent'});
          this.component_array.push({name:'Event', active: true, id:'child_class'});
        }else{
          this.alertService.showNotification('Something went wrong','error');
        }
      });
    }
  }

  /* 
  * Function to show Admin profile details
  */
  showAdminProfileDetails(){
    if(this.default_id){
      this.restApiService.getData('user/'+this.default_id,(admin_profile_response)=>{
        if(admin_profile_response && admin_profile_response['id'] && admin_profile_response.userProfile){
          this.default_details = [];
          this.default_details['name'] = admin_profile_response.userProfile.firstName +" "+admin_profile_response.userProfile.lastName;
          this.default_details['id'] = admin_profile_response.id;
          this.default_details['email'] = admin_profile_response.email;
          var EmailName = this.default_details['email'].substring(0, this.default_details['email'].lastIndexOf("@"));
          if(admin_profile_response.userProfile.firstName){
          this.profileName = admin_profile_response.userProfile.firstName+" "+admin_profile_response.userProfile.lastName;
          if(admin_profile_response.userProfile['defaultSnapId']){
            this.restApiService.getData('snap/'+admin_profile_response.userProfile['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                this.default_details['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
              }
            });
          }else{
            this.default_details['staticDpImg']='';
          } 
        }
        else 
          this.profileName = EmailName;

          this.default_details['imgName'] = (admin_profile_response.userProfile.firstName ? admin_profile_response.userProfile.firstName.slice(0,1) : '') + (admin_profile_response.userProfile.lastName ? admin_profile_response.userProfile.lastName.slice(0,1) : '');
          this.default_details['editPermission']=false;
          this.component_array = [];
          this.component_array.push({name:'About', active: true, id:'admin_about'});
        }
      });
    }
  }

  /* 
  * Function to show school profile details
  */
  showSchoolProfileDetails(){
    if(this.default_id){
      this.restApiService.getData('school/'+this.default_id,(school_profile_response)=>{
        if(school_profile_response && school_profile_response['id']){
          this.default_details = [];
          this.default_details['id'] = school_profile_response.id;
          this.default_details['name'] = school_profile_response.name;
          this.school_name = '';
          if(school_profile_response['defaultSnapId']){
            this.restApiService.getData('snap/'+school_profile_response['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                this.default_details['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
              }
            });
          }else{
            this.default_details['staticDpImg']='';
          }
          this.default_details['imgName'] = (school_profile_response.name ? school_profile_response.name.slice(0,1) : '');
          this.default_details['editPermission']=false;
          this.component_array = [];
          this.dataService.saveSchoolDetails(school_profile_response);
          this.component_array.push({name:'About', active: true, id:'school_about'});
        }
      });
    }
  }

  /*
  * default edit Profile details
  */
  editProfile(url){
    if(url && this.selected_role=='ADMIN'){
      return this.router.navigateByUrl(url);
    }
  }

  /*
  * Function to show Respective component
  */
  showRespectiveComponent(component_id){
    if(this.component_array && this.component_array.length>0 && component_id){
      var check_index_value = this.component_array.filter((obj)=>{ return obj.id === component_id});
      if(check_index_value.length>0){
        this.component_array.forEach(element => {
          element.active = false;
        });
        check_index_value.forEach(element => {
          element.active = true;
        });
      }
    }
  }

  /*
  * Function to go back to previous page
  */
  goBack(){
    this.helperService.goBack();
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
