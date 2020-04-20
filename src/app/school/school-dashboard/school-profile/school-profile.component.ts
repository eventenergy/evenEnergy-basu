import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { School } from './school';
import { AWS_DEFAULT_LINK } from '../../../config';
import { HelperService } from '../../../_helpers';
import { RestAPIService, AuthenticationService, AlertService } from '../../../_services';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';

@Component({
  selector: 'app-school-profile',
  templateUrl: './school-profile.component.html',
  styleUrls: ['./school-profile.component.scss'],
})
export class SchoolProfileComponent implements OnInit {
  private unsubscribe$ = new Subject();
  school_id:number;
  schoolModel=new School();
  selectedFile:File;
  schoolStaticDpImg:string;
  schoolStaticDpImgKey:string;
  user_id:number;
  image_reader:boolean = false;
  image_reader_url;
  fileUploadEvent: any;
  
  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService : HelperService,
    private alertService: AlertService,
    private awsImageuploadService: AwsImageUploadService
    ) {
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if(params['id']){
        this.school_id = params['id'];
      }else{
        return this.helperService.goBack();
      }
    });
   }

  /*
  * Default life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Organization Profile' );//alert service for set title

    var obj = this;
    var response;
    obj.authenticateService.getUserObject().subscribe((result)=>{
      response=result;
    });
    if(response){
      if(response['user'] && response['user']['id'] && this.school_id){
        obj.user_id = response['user']['id'];
        this.restApiService.getData('school/'+this.school_id, (school_result)=>{
          if(school_result && school_result['id']){
            if(school_result['defaultSnapId']){
              this.restApiService.getData('snap/'+school_result['defaultSnapId'],(snap_details_response)=>{
                if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                  this.schoolStaticDpImg=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  this.schoolStaticDpImgKey = snap_details_response.imgPath;
                }
              });
            }else{
              this.schoolStaticDpImg='';
            }
            this.schoolModel = new School(school_result.id, school_result.name, school_result.defaultSnapId, 
                                          school_result.address, school_result.about, school_result.emailAddress, 
                                          school_result.website,school_result.mobNo);
          }
        });
      }else{
        return obj.router.navigate(['/login']);
      }
    }else{
      if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
        obj.authenticateService.checkExpiryStatus();
      }
      return obj.router.navigate(['/login']);
    }
  }


  /*
  * Function to go back to particular location
  */
  goBack(){
    this.helperService.goBack();
  }
  
  /*
  * Function to save or update School Details
  */
  saveSchoolDetails(form: NgForm){
    if(this.schoolModel.id!==0){
      var email_pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
      var website_url_pattern = new RegExp("https?://.+");

      if(this.schoolModel.name && this.schoolModel.name.trim()){
        if(this.schoolModel.emailAddress && this.schoolModel.emailAddress.trim() && !email_pattern.test(this.schoolModel.emailAddress.trim())){
          this.alertService.showNotification('You have entered a invalid email address.','error');
          return false;
        }
        if(this.schoolModel.mobNo && this.schoolModel.mobNo.internationalNumber){
          if(form.controls.mobile_number.status == 'INVALID' && form.value.mobile_number.number){
            this.alertService.showNotification('Mobile number is invalid','error');
            return false;
          }
        }

        if(this.schoolModel.website && this.schoolModel.website.toString().trim()  && !website_url_pattern.test(this.schoolModel.website.toString().trim())){
          this.alertService.showNotification('Webiste URL should start either with http:// or https://','error');
          return false;
        }
        this.onUpload((snap_id_response)=>{
          let snap_id = snap_id_response;
          if(snap_id && this.schoolModel.defaultSnapId){
            this.schoolModel.defaultSnapId = snap_id;
          }else if(snap_id){
            this.schoolModel.defaultSnapId = snap_id;
          }
          this.schoolModel = new School(this.schoolModel.id, 
                                      (this.schoolModel.name ? this.schoolModel.name.trim() : this.schoolModel.name), 
                                      this.schoolModel.defaultSnapId, (this.schoolModel.address ? this.schoolModel.address.trim() : this.schoolModel.address), 
                                      (this.schoolModel.about ? this.schoolModel.about.trim() : ''), (this.schoolModel.emailAddress ? this.schoolModel.emailAddress.trim() : this.schoolModel.emailAddress), 
                                      (this.schoolModel.website ? this.schoolModel.website.trim() : '')
                                      ,(this.schoolModel.mobNo ? this.schoolModel.mobNo.internationalNumber : ''));
          this.restApiService.putAPI('school/update',this.schoolModel,(response)=>{
            if(response && response['id']){
              this.alertService.showAlertBottomNotification('Organization Profile updated');
              this.authenticateService.pushUpdatedDetails();
              setTimeout(()=>{ this.helperService.goBack();},1000);
            }else if(response && response['message'] && !response['success']){
              this.alertService.showNotification(response['message'],'error')
              if(response['message'].indexOf('Error: School with email:')>-1){
                this.alertService.showNotification('Organization Name already exists','error');
              }
            }else{
              this.alertService.showNotification('Something went wrong, please try again','error')
            }
          });
        });
      }else{
        this.alertService.showNotification('Organization Name field is required','error')
      }
    }
  }

  uploadToCrop(event){
    this.fileUploadEvent = event;
  }

  /*
  * Function to Check file size, type
  */
  onFileChanged(event){
    this.selectedFile = event;
    if(this.selectedFile){
      if (!this.helperService.validateFileExtension(this.selectedFile.name)) {
        this.alertService.showNotification('Selected file format is not supported','error');
        return false;
      }
      if (!this.helperService.validateFileSize(this.selectedFile.size)) {
        this.alertService.showNotification('Selected file size is more, please check and try again','error');
        return false;
      }
      this.image_reader = true;
      var reader = new FileReader();
      reader.readAsDataURL(event);
      reader.onload = (event:any) => {
        this.image_reader_url = event.target.result;
      }
    }
  }

  /* Rest API call to upload a file */
  onUpload(callback) {
    if(this.selectedFile && this.user_id && this.school_id){
      this.awsImageuploadService.getSnapIdForAWSUploadedImages({file_data: this.selectedFile,folder:'school-picture/'+this.user_id,user_id:this.user_id,school_id:0,type:1},(snap_id_response)=>{
      // this.helperService.getSnapId({file_data:this.selectedFile,user_id:this.user_id,school_id:this.school_id},(snap_id_response)=>{
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
    if(this.schoolStaticDpImg && this.schoolModel.defaultSnapId){
      $('#alert_delete_profile_pic_popup').modal('show');
    }else if(this.image_reader && this.selectedFile){
      this.image_reader = false;
      this.selectedFile = null;
      this.image_reader_url ='';
    }
  }

  deleteProfileImageFromDB(){
    if(this.schoolStaticDpImg && this.schoolModel.defaultSnapId){
      this.schoolStaticDpImg = '';
      this.schoolModel = new School(this.schoolModel.id, 
                    (this.schoolModel.name ? this.schoolModel.name.trim() : this.schoolModel.name), 
                    0, (this.schoolModel.address ? this.schoolModel.address.trim() : this.schoolModel.address), 
                    (this.schoolModel.about ? this.schoolModel.about.trim() : ''), (this.schoolModel.emailAddress ? this.schoolModel.emailAddress.trim() : this.schoolModel.emailAddress), 
                    (this.schoolModel.website ? this.schoolModel.website.trim() : '')
                    ,(this.schoolModel.mobNo ? this.schoolModel.mobNo.internationalNumber : ''));
      this.restApiService.putAPI('school/update',this.schoolModel,(response)=>{
          if(response && response['id']){
          this.authenticateService.pushUpdatedDetails();
          $('#alert_delete_profile_pic_popup').modal('hide');
          this.restApiService.deleteAPI('snap/'+this.schoolModel.defaultSnapId,(response)=>{
            this.schoolModel.defaultSnapId = null;
          });
          this.alertService.showNotification('Organization Pic Deleted');
          if(this.schoolStaticDpImgKey){
            this.awsImageuploadService.deleteFile(this.schoolStaticDpImgKey,(delete_response)=>{
              if(delete_response){
                this.schoolStaticDpImgKey = '';
              }
            });
          }
        }
      });
    }
  }
  
  /* 
  * Angular default life cycle method 
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }

  /*
  * Check input type 
  */
  numberOnly(event): boolean {
    if(event.target.value){
      event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
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

  debug(file){
    console.log(file);
  }
}