import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HelperService } from 'src/app/_helpers';
import { RestAPIService, AuthenticationService, AlertService } from 'src/app/_services';
import { API_URL_LINK, AWS_DEFAULT_LINK } from 'src/app/config';

@Component({
  selector: 'app-user-child-profile',
  templateUrl: './user-child-profile.component.html',
  styleUrls: ['./user-child-profile.component.scss']
})
export class UserChildProfileComponent implements OnInit {
  private unsubscribe$ = new Subject();
  child_id:number;
  default_details:any;
  component_array = new Array();
  
  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private alertService: AlertService,
  ) {
    if(this.router.url){
      const urlTree = this.router.parseUrl(this.router.url);
      if(urlTree){
        this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
          if(params && params['id'] && parseInt(params['id'])){
            this.child_id=parseInt(params['id']);
            this.showChildProfileDetails()
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
    this.alertService.setTitle( 'Child Profile' );//alert service for set title

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
  * Function to show child profile details
  */
  showChildProfileDetails(){
    if(this.child_id){
      this.restApiService.getData('user/child/'+this.child_id,(child_profile_response)=>{
        if(child_profile_response && child_profile_response['id']){
          this.default_details = [];
          this.default_details['name'] = child_profile_response.firstName +" "+child_profile_response.lastName;
          this.default_details['id'] = child_profile_response.id;
          if(child_profile_response['defaultSnapId']){
            this.restApiService.getData('snap/'+child_profile_response['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                this.default_details['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
              }
            });
          }else{
            this.default_details['staticDpImg']='';
          }
          this.default_details['imgName'] = (child_profile_response.firstName ? child_profile_response.firstName.slice(0,1) : '') + (child_profile_response.lastName ? child_profile_response.lastName.slice(0,1) : '');
          this.default_details['editPermission']=true;
          this.default_details['dob'] = child_profile_response.dob;
          this.default_details['route_url'] = '/user/child/add?type=edit&id='+child_profile_response.id;
          this.component_array = [];
          this.component_array.push({name:'School', active: true, id:'child_school'});
        }else{
          this.alertService.showNotification('Something went wrong','error');
        }
      });
    }
  }

 
  /*
  * default edit Profile details
  */
  editProfile(url){
    if(url){
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