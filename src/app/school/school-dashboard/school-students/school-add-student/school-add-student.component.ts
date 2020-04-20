import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HelperService } from '../../../../_helpers';
import { AuthenticationService, RestAPIService, DataService, AlertService } from '../../../../_services';
import { Subject } from 'rxjs';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';

@Component({
  selector: 'app-school-add-student',
  templateUrl: './school-add-student.component.html',
  styleUrls: ['./school-add-student.component.scss'],
  providers: [DatePipe],
})

export class SchoolAddStudentComponent implements OnInit {
  private unsubscribe$ = new Subject();
  childModel= new Student();
  datepickerConfig:any;
  school_id:number;
  child_id:number;
  user_id:number;
  selectedFile:File;

  first_name_error:boolean=false;
  last_name_error:boolean=false;
  dob_error:boolean=false;
  gender_error:boolean=false;
  email_error:boolean=false;

  dpImg_reader_status:boolean=false;
  dpImg_reader:string;

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private datePipe: DatePipe,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
    private awsImageuploadService: AwsImageUploadService,
  ){
    this.datepickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'DD/MM/YYYY',
     });
  }
  
  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          obj.user_id = response['user']['id'];
          if(obj.dataService.hasSchoolId()){
            obj.school_id = obj.dataService.hasSchoolId();
          }else{
            return obj.helperService.goBack();
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
  * Function to go back to respective location
  */
  goBack(){
    this.helperService.goBack();
  }
  
  /* Date Pipe to change format*/
  transformDate(date) {
    date = new Date(date);
    return this.datePipe.transform(date, "yyyy-MM-dd"); //whatever format you need. 
  }
  
  /* Date Picker Event */
  onChangeDatePickerStart(event: any) {
    if(event)
      this.childModel.dob=event;
  }

  /* File upload Required function */
  onFileChanged(event){
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
        this.dpImg_reader_status=true;
        this.dpImg_reader=e.target.result;
      }
      reader.readAsDataURL(this.selectedFile);
    }
  }

  /* Rest API call to upload a file */
  onUpload(callback) {
    if(this.selectedFile && this.user_id){
      this.awsImageuploadService.getSnapIdForAWSUploadedImages({file_data: this.selectedFile,folder:'profile-picture/'+this.user_id+'/admin/child',user_id:this.user_id,school_id:0,type:1},(snap_id_response)=>{
      // this.helperService.getSnapId({file_data:this.selectedFile,user_id:this.user_id,school_id:0},(snap_id_response)=>{
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
    if(this.dpImg_reader_status && this.selectedFile){
      this.dpImg_reader_status = false;
      this.selectedFile = null;
      this.dpImg_reader='';
    }
  }


   /*
  * Adding child
  */
  addChildDetails(){
    var email_pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
    if(this.school_id && this.childModel.email && this.childModel.email.trim() && email_pattern.test(this.childModel.email.trim()) && this.childModel.firstName && this.childModel.firstName.toString().trim() && this.childModel.lastName
      && this.childModel.lastName.toString().trim() && this.childModel.dob && this.childModel.male && this.childModel.male.toString().trim()){
      this.restApiService.postAPI('user/getByEmailId',{"email":this.childModel.email.toString().trim()},(getEmail_response)=>{
        if(getEmail_response){
          var id=0;
          if(Array.isArray(getEmail_response) && getEmail_response.length>0){
            getEmail_response.forEach(element => {
              if(element.id){
                id=element.id;
              }
            });
          }
          this.childModel.Tdob=this.transformDate(this.childModel.dob);
          this.childModel.male=='male' ? this.childModel.male=1 : this.childModel.male=0;
          this.onUpload((snap_id_response)=>{
            if(snap_id_response){
              this.childModel.defaultSnapId = snap_id_response;
            }
            var data = {
              "firstName":this.childModel.firstName.toString().trim(),
              "lastName":this.childModel.lastName.toString().trim(),
              "male":this.childModel.male,
              "dob":this.childModel.Tdob,
              "defaultSnapId": this.childModel.defaultSnapId,
            }
            this.restApiService.postAPI('parent/getChild/'+id,data,(parent_getchild_response)=>{
              if(parent_getchild_response && parent_getchild_response['id']){
                this.child_id=parent_getchild_response['id'];
                var childBind={
                  "childProfile" : {
                    "id": this.child_id
                  },
                  "parentEmailId" : this.childModel.email.toString().trim(),
                  "school" : {
                    "id": this.school_id
                  },
                  "requestDate" : new Date(),
                }
                this.restApiService.putAPI('childBind/requestChild',childBind,(childbind_response)=>{
                  if(childbind_response && childbind_response['id']){
                    this.restApiService.postAPI('parent/request/school/'+this.school_id+'/student/'+this.child_id,{"registrationMessage":"Admin Default"},(response)=>{
                      this.restApiService.putAPI('parent/'+this.child_id+'/request/school/'+this.school_id+'/approve',{},(response)=>{});
                    });
                    this.alertService.showAlertBottomNotification('Invite sent');
                    setTimeout(()=>{this.helperService.goBack(); },1000);
                  }else if(childbind_response && !childbind_response['success']){
                    this.alertService.showNotification('Something went wrong, please try again','error');
                    return false;
                  }
                });
              }else if(parent_getchild_response && !parent_getchild_response['success']){
                this.alertService.showNotification('Something went wrong, please try again','error');
                return false;
              }
            });
          });
        }
      });
    }else{
      (!this.childModel.firstName || (this.childModel.firstName && !this.childModel.firstName.trim())) ? this.first_name_error=true : this.first_name_error=false;
      (!this.childModel.lastName || (this.childModel.lastName && !this.childModel.lastName.trim()))  ? this.last_name_error=true : this.last_name_error=false;
      !this.childModel.dob ? this.dob_error=true : this.dob_error=false;
      !this.childModel.male ? this.gender_error=true : this.gender_error=false;
      (!this.childModel.email || (this.childModel.email && !email_pattern.test(this.childModel.email.toString().trim()))) ? this.email_error=true : this.email_error=false;
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

/* 
* Student Class model
*/
export class Student{
  constructor(
    public male:any='',
    public firstName:string='',
    public lastName:string='',
    public defaultSnapId:number=null,
    public dob:string='',
    public email:string='',
    public Tdob:string='',
  ){}
}