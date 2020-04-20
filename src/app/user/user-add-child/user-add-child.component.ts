import { Component, OnInit } from '@angular/core';
import { Child } from './child';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AWS_DEFAULT_LINK } from '../../config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { RestAPIService, AuthenticationService, AlertService } from '../../_services';
import { HelperService } from '../../_helpers';
import { Subject } from 'rxjs';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';

@Component({
  selector: 'app-user-add-child',
  templateUrl: './user-add-child.component.html',
  styleUrls: ['./user-add-child.component.scss'],
  providers: [DatePipe],
})
export class UserAddChildComponent implements OnInit {
  childModel=new Child();
  type:string='add';
  
  user_id:number;
  user_total_child_array=new Array();
  
  first_name_error:boolean=false;
  last_name_error:boolean=false;
  dob_error:boolean=false;
  gender_error:boolean=false;
 
  params_child_id:number;
  selectedFile:File;
  staticDpImg:string;
  dpImg_reader_status:boolean=false;
  dpImg_reader:string;
  public datepickerConfig: Partial< BsDatepickerConfig > = new BsDatepickerConfig();
  
  school_list_array= new Array();
  childStaticDpImgKey:string;

  private unsubscribe$ = new Subject();
  
  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private datePipe: DatePipe,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService : HelperService,
    private alertService: AlertService,
    private awsImageuploadService: AwsImageUploadService
  ){
    this.datepickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'DD/MM/YYYY',
     });
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if(params && params['type'] && params['type']=='edit' && params['id']){
        this.params_child_id = params['id'];
        this.type="edit";
      }
    });
  }

  /* 
  * Function to go Back
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
  * default Angular Life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Add Child' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          this.user_id=response['user']['id'];
          if(this.user_id){
            this.getChildList();
          }
          if(this.params_child_id){
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
                      this.staticDpImg = AWS_DEFAULT_LINK+snap_details_response.imgPath;
                      this.childStaticDpImgKey = snap_details_response.imgPath;
                    }
                  });
                }
                this.childModel.firstName=child_response['firstName'];
                this.childModel.lastName=child_response['lastName'];
                this.childModel.defaultSnapId=child_response['defaultSnapId'];
                this.childModel.dob=this.transformDateChange(child_response['dob']);
                if(child_response['male']==true){
                  this.childModel.male='male';
                }else{
                  this.childModel.male='female';
                }
              }
            });
          }
        }else{
          return obj.router.navigateByUrl('/login');
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
  * Adding and updating child
  */
  addChildDetails(type){
    if(this.childModel.assignedUsers.length>0 && this.childModel.firstName && this.childModel.firstName.trim() && this.childModel.lastName && this.childModel.lastName.trim() && this.childModel.dob && this.childModel.male){
      if(type=='add'){
        this.childModel.Tdob=this.transformDate(this.childModel.dob);
        this.childModel.male=='male' ? this.childModel.male=1 : this.childModel.male=0;
        this.onUpload((snap_id_response)=>{
          // if(snap_id_response && this.childModel.defaultSnapId){
          //   this.childModel.defaultSnapId = snap_id_response;
          // }else
          if(snap_id_response){
            this.childModel.defaultSnapId = snap_id_response;
          }
          var add_child_details={
            "firstName": this.childModel.firstName.trim(),
            "lastName": this.childModel.lastName.trim(),
            "status":this.childModel.status,
            "defaultSnapId":this.childModel.defaultSnapId,
            "assignedUsers": this.childModel.assignedUsers,
            "male": this.childModel.male,
            "dob":this.childModel.Tdob,
          }
           this.restApiService.postAPI('parent/addChild',add_child_details,(add_child_response)=>{
            if(add_child_response && add_child_response['id']){
              this.alertService.showAlertBottomNotification('Child created')
              var resetForm = <HTMLFormElement>document.getElementById('child_form');
              resetForm.reset();
              this.dpImg_reader_status=false;
              this.dpImg_reader='';
              setTimeout(()=>{this.helperService.goBack(); },1000);
            }else{
              this.alertService.showNotification('Something went wrong','error');
            }
          });
        });
      }else if(type=='edit'){
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
      this.awsImageuploadService.getSnapIdForAWSUploadedImages({file_data: this.selectedFile,folder:'profile-picture/'+this.user_id+'/child',user_id:this.user_id,school_id:0,type:1},(snap_id_response)=>{
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
  * To Get Child list
  */
  getChildList(){
    this.user_total_child_array=[];
    if(this.user_id){
      this.restApiService.getData('user/childlist/'+this.user_id,(child_response)=>{
        if(child_response && Array.isArray(child_response) && child_response.length > 0){
          child_response.forEach(element => {
            var check_id=this.user_total_child_array.filter((details)=>{ return details.id === element.id});
            if(check_id.length==0){
              if(element['defaultSnapId']){
                this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                  if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                    element['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  }
                });
              }else{
                element['staticDpImg']='';
              }
              this.user_total_child_array.push(element);
            }
          });
        }
      });
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
  * Default Angular Life cycle method
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event){
    this.helperService.updateDefaultImageUrlHelper(event);
  }
  
}
