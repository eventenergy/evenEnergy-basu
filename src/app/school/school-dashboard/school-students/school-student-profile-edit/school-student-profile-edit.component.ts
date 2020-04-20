import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { HelperService } from 'src/app/_helpers';
import { RestAPIService, AuthenticationService, DataService, AlertService } from 'src/app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { DatePipe } from '@angular/common';
import { Child } from 'src/app/user/user-add-child/child';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';

@Component({
  selector: 'app-school-student-profile-edit',
  templateUrl: './school-student-profile-edit.component.html',
  styleUrls: ['./school-student-profile-edit.component.scss'],
  providers: [DatePipe],
})
export class SchoolStudentProfileEditComponent implements OnInit {
  private unsubscribe$ = new Subject();
  params_child_id:number;
  childModel=new Child();
  type="edit";
  staticDpImg:string;
  childStaticDpImgKey:string;
  user_id:number;

  selectedFile:File;
  dpImg_reader_status:boolean=false;
  dpImg_reader:string;
  public datepickerConfig: Partial< BsDatepickerConfig > = new BsDatepickerConfig();

  first_name_error:boolean=false;
  last_name_error:boolean=false;
  dob_error:boolean=false;
  gender_error:boolean=false;

  constructor(
    private router:Router,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
    public route:ActivatedRoute,
    private datePipe: DatePipe,
    private awsImageuploadService: AwsImageUploadService
  ) { 
    this.datepickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'DD/MM/YYYY',
     });
     this.route.paramMap.takeUntil(this.unsubscribe$).subscribe(params=>{
      this.params_child_id= parseInt(params.get('id'));
      if(!this.params_child_id){
        this.helperService.goBack();
      }
    });
  }

  ngOnInit() {
    var obj = this;
    this.route.paramMap.takeUntil(this.unsubscribe$).subscribe(params=>{
      obj.params_child_id= parseInt(params.get('id'));
      if(!isNaN(obj.params_child_id)){
        obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
          if(response){
            if(response['user'] && response['user']['id']){
              obj.user_id = response['user']['id'];
              if(obj.params_child_id){
                this.restApiService.getData('user/child/'+this.params_child_id,(child_response)=>{
                  if(child_response && child_response['id']){
                    if(child_response['users'] && Array.isArray(child_response['users']) && child_response['users'].length > 0){
                      child_response['users'].forEach(user_element => {
                        if(user_element && user_element.id){
                          this.childModel.assignedUsers.push(user_element.id);
                        }
                      });
                    }
                    if(child_response['defaultSnapId']){
                      this.restApiService.getData('snap/'+child_response['defaultSnapId'],(snap_details_response)=>{
                        if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                          obj.staticDpImg = AWS_DEFAULT_LINK+snap_details_response.imgPath;
                          obj.childStaticDpImgKey = snap_details_response.imgPath;
                        }
                      });
                    }
                    obj.childModel.firstName=child_response['firstName'];
                    obj.childModel.lastName=child_response['lastName'];
                    obj.childModel.defaultSnapId=child_response['defaultSnapId'];
                    obj.childModel.dob=this.transformDateChange(child_response['dob']);
                    obj.onChangeDatePickerStart(obj.childModel.dob);
                    if(child_response['male']==true){
                      obj.childModel.male='male';
                    }else{
                      obj.childModel.male='female';
                    }
                  }
                });
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
      }else{
        this.alertService.showNotification('Something went wrong','error');
        this.helperService.goBack();
      }
    });
  }

  
  /* Date Picker Event */
  onChangeDatePickerStart(event: any) {
    this.childModel.dob=event;
    // this.item.timeStart = this.toISO(event);
  }

  /* Date Pipe to change format*/
  transformDate(date) {
    date = new Date(date);
    return this.datePipe.transform(date, "yyyy-MM-dd"); //whatever format you need. 
  }
  
  /* Date Pipe to change format */
  transformDateChange(date) {
    return this.datePipe.transform(date, "dd/MM/yyyy"); //whatever format you need. 
  }

  /*
  * Adding and updating child
  */
 addChildDetails(type){
  if(this.childModel.assignedUsers.length>0 && this.childModel.firstName && this.childModel.firstName.trim() && this.childModel.lastName && this.childModel.lastName.trim() && this.childModel.dob && this.childModel.male){
    if(type=='edit'){
      if(this.params_child_id){
        this.childModel.Tdob=this.transformDate(this.childModel.dob);
        this.childModel.male=='male' ? this.childModel.male=1 : this.childModel.male=0;
        this.onUpload((snap_id_response)=>{
          if(snap_id_response && this.childModel.defaultSnapId){
            this.childModel.defaultSnapId = snap_id_response;
          }else if(snap_id_response){
            this.childModel.defaultSnapId = snap_id_response;
          }
          var edit_child_details={
            "id":this.params_child_id,
            "firstName": this.childModel.firstName.trim(),
            "lastName": this.childModel.lastName.trim(),
            "status":this.childModel.status,
            "defaultSnapId":this.childModel.defaultSnapId,
            "assignedUsers": this.childModel.assignedUsers,
            "male": this.childModel.male,
            "dob":this.childModel.Tdob,
          }
          this.restApiService.postAPI('parent/addChild',edit_child_details,(edit_response)=>{
            if(edit_response && edit_response['id']){
              this.alertService.showAlertBottomNotification('Child updated');
              if(edit_response['male']){
                this.childModel.male='male';
              }else{
                this.childModel.male='female';
              }
              this.childModel.firstName=edit_response['firstName'];
              this.childModel.lastName=edit_response['lastName'];
              this.childModel.dob=this.transformDateChange(edit_response['dob']);
              this.childModel.defaultSnapId=edit_response['defaultSnapId'];
              setTimeout(()=>{this.helperService.goBack(); },1000);
            }else{
              this.alertService.showNotification('Something went wrong','error');
            }
          });
        });
      }
    }
  }else{
    (!this.childModel.firstName || (this.childModel.firstName && !this.childModel.firstName.trim())) ? this.first_name_error=true : this.first_name_error=false;
    (!this.childModel.lastName || (this.childModel.lastName && !this.childModel.lastName.trim())) ? this.last_name_error=true : this.last_name_error=false;
    !this.childModel.dob ? this.dob_error=true : this.dob_error=false;
    !this.childModel.male ? this.gender_error=true : this.gender_error=false;
  }
}

/* File upload Required function */
onFileChanged(event) {
  this.selectedFile = event.target.files[0];
  if(this.selectedFile){
    if (!this.helperService.validateFileExtension(this.selectedFile.name)) {
      this.alertService.showNotification('Selected file format is not supported','error');
      return false;
    }
    if (!this.helperService.validateFileSize(this.selectedFile.size)) {
      this.alertService.showNotification('Selected file size is more','error');
      return false;
    }
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.staticDpImg = null;
      this.dpImg_reader_status=true;
      this.dpImg_reader=e.target.result;
    }
    reader.readAsDataURL(this.selectedFile); 
  }
}


  /* Rest API call to upload a file */
  onUpload(callback) {
    if(this.selectedFile && this.user_id){
      this.awsImageuploadService.getSnapIdForAWSUploadedImages({file_data: this.selectedFile,folder:'profile-picture/child',user_id:this.user_id,school_id:0,type:1},(snap_id_response)=>{
        if(snap_id_response){
          return callback && callback(snap_id_response);
        }else{
          return callback && callback(0);
        }
      });
    }else{
      return callback && callback(0);
    }
  }

/*
* Delete Profile photo
*/
deleteProfileImage(){
  if(this.staticDpImg && this.childModel.defaultSnapId){
    $('#alert_delete_profile_pic_popup').modal('show');
  }else if(this.dpImg_reader_status && this.selectedFile){
    this.dpImg_reader_status = false;
    this.selectedFile = null;
    this.dpImg_reader='';
  }
}

deleteProfileImageFromDB(){
  if(this.staticDpImg && this.childModel.defaultSnapId){
    this.staticDpImg = '';
    if(this.childModel.defaultSnapId && this.params_child_id){
      this.childModel.Tdob=this.transformDate(this.childModel.dob);
      this.childModel.male=='male' ? this.childModel.male=1 : this.childModel.male=0;
      var edit_child_details={
        "id":this.params_child_id,
        "firstName": this.childModel.firstName.trim(),
        "lastName": this.childModel.lastName.trim(),
        "status":this.childModel.status,
        "defaultSnapId":null,
        "assignedUsers": this.childModel.assignedUsers,
        "male": this.childModel.male,
        "dob":this.childModel.Tdob,
      }
      this.restApiService.postAPI('parent/addChild',edit_child_details,(edit_response)=>{
        if(edit_response && edit_response['id']){
          this.restApiService.deleteAPI('snap/'+this.childModel.defaultSnapId,()=>{
            this.childModel.defaultSnapId = null;
          });
          $('#alert_delete_profile_pic_popup').modal('hide');
          if(edit_response['male']){
            this.childModel.male='male';
          }else{
            this.childModel.male='female';
          }
          if(this.childStaticDpImgKey){
            this.awsImageuploadService.deleteFile(this.childStaticDpImgKey,(delete_response)=>{
              if(delete_response){
                this.childStaticDpImgKey = '';
                this.alertService.showNotification('Child Pic Deleted');
              }
            });
          }
        }
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

  
  /* 
  * Function to go Back
  */
  goBack(){
    this.helperService.goBack();
  }



}
