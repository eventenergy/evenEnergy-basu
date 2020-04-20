import { Component, OnInit } from '@angular/core';
import { AWS_DEFAULT_LINK } from '../../../../config';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HelperService } from '../../../../_helpers';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../../../_services';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';

@Component({
  selector: 'app-school-add-class',
  templateUrl: './school-add-class.component.html',
  styleUrls: ['./school-add-class.component.scss']
})
export class SchoolAddClassComponent implements OnInit {
  private unsubscribe$ = new Subject();
  school_id:number;

  school_teacher_array=new Array();
  school_child_array=new Array();
  classModel= new Class();
  room_name_error:boolean=false;
  staticDpImg:string;
  classStaticDpImgKey:string;
  dpImg_reader_status:boolean=false;
  dpImg_reader:string;
  type:string='add';
  selectedFile:File;
  class_id:number;
  user_id:number;
  class_teacher_array=[];
  class_children_array=[];

  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
    private awsImageuploadService: AwsImageUploadService
  ) {
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if(params['type']){
        this.type=params['type'];
      }
      if(params['id']){
        this.class_id=params['id'];
      }
    });
   }
  
  /*
  * default Angular Destroy Method
  */
   ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    this.alertService.setTitle( 'Add Class' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          obj.user_id=response['user']['id'];
          if(obj.dataService.hasSchoolId()){
            obj.school_id=obj.dataService.hasSchoolId();
            obj.classModel.schoolId=obj.school_id;
            if(obj.school_id){
              this.getSchoolChildList();
              this.getSchoolTeacherList();
            }
            if(this.type=='edit' && this.class_id){
              this.assignClassData();
            }
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
  * Back Button function to go back
  */
  goBack(){
    this.helperService.goBack();
  }

  /* Assigning class Data Through REST API */
  assignClassData(){
    if(this.class_id){
      this.restApiService.getData('classroom/'+this.class_id,(response)=>{
        if(response && response['id']){
          this.classModel=new Class(response.name,response.defaultSnapId,response.schoolId);
          if(response['defaultSnapId']){
            this.restApiService.getData('snap/'+response['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                this.staticDpImg=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                this.classStaticDpImgKey = snap_details_response.imgPath;
              }
            });
          }
        }
      });
    }
  }

  /* Get School Teacher list */
  getSchoolTeacherList(){
    this.getClassTeacher();
  }

  /* Get School Teacher API CALL */
  getClassTeacher(){
    if(this.class_id){
      this.restApiService.getData('classroomteacher/class/'+this.class_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.teacherUser){
              if(this.class_teacher_array.indexOf(parseInt(element.teacherUser.id))==-1){
                this.class_teacher_array.push(element.teacherUser.id);
              }
            }
          });
          this.getSchoolTeacherListCallBack();
        }else{
          this.getSchoolTeacherListCallBack();
        }
      });
    }else{
      this.getSchoolTeacherListCallBack();
    }
  }

  /* 
  * Get School Teacher list Callback function
  */
  getSchoolTeacherListCallBack(){
    this.school_teacher_array=new Array();
    if(this.school_id){
      this.restApiService.getData('teacher/request/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.teacher && element.user && element.user.id && element.user.userProfile){
              var check_id=this.school_teacher_array.filter((details)=>{ return details.id === element.id; });
              if(check_id.length==0){
                var teacher=[];
                if(this.class_teacher_array.indexOf(element.id)==-1){
                  teacher['isChecked']=false;
                }else{
                  teacher['isChecked']=true;
                }
                teacher['firstName']=element.user.userProfile.firstName;
                teacher['lastName']=element.user.userProfile.lastName;
                teacher['id']=element.id;
                if(element.user.userProfile['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.user.userProfile['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      teacher['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  teacher['staticDpImg']='';
                }
                this.school_teacher_array.push(teacher);
              }
            }
          });
        }
      });
    }
  }

  /* Selecting Teacher */
  selectTeacher(id){
    var check_id=this.school_teacher_array.filter((details)=>{ return details.id === parseInt(id) && details.isChecked === true});
    if(check_id.length==0){
      var index_value= this.school_teacher_array.findIndex(obj => obj.id==parseInt(id));
      if(index_value>-1){
        if(typeof this.school_teacher_array[index_value] !== 'undefined') {
          this.school_teacher_array[index_value]['isChecked']=true;
        }
      }
    }else{
      var index_value= this.school_teacher_array.findIndex(obj => obj.id==parseInt(id));
      if(index_value>-1){
        if(typeof this.school_teacher_array[index_value] !== 'undefined') {
          this.school_teacher_array[index_value]['isChecked']=false;
        }
      }
    }
  }

  /* Get child list */
  getSchoolChildList(){
    this.getClassStudent();
  }

  /* Get child list REST API call */
  getClassStudent(){
    if(this.class_id){
      this.restApiService.getData('classroomstudent/class/'+this.class_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.childProfile){
              if(this.class_children_array.indexOf(parseInt(element.childProfile.id))==-1){
                this.class_children_array.push(element.childProfile.id);
              }
            }
          });
          this.getSchoolChildListCallBack();
        }else{
          this.getSchoolChildListCallBack();
        }
      });
    }else{
      this.getSchoolChildListCallBack();
    }
  }

  /* Get child list callback */
  getSchoolChildListCallBack(){
    if(this.school_id){
      this.school_child_array=[];
      this.restApiService.getData('parent/request/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element.status && element.child){
              var check_id=this.school_child_array.filter((details)=>{ return details.id === element.child.id; });
              if(check_id.length==0){
                var child=[];
                if(this.class_children_array.indexOf(element.child.id)==-1){
                  child['isChecked']=false;
                }else{
                  child['isChecked']=true;
                }
                child['firstName']=element.child.firstName;
                child['lastName']=element.child.lastName;
                child['id']=element.child.id;
                if(element.child['defaultSnapId']){
                  this.restApiService.getData('snap/'+element.child['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      child['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  child['staticDpImg']='';
                }
                this.school_child_array.push(child);
              }
            }
          });
        }
      });
    }
  }

  /* Selecting Children */
  selectChild(id) {
    var check_id=this.school_child_array.filter((details)=>{ return details.id === parseInt(id) && details.isChecked === true});
    if(check_id.length==0){
      var index_value= this.school_child_array.findIndex(obj => obj.id==parseInt(id));
      if(index_value>-1){
        if(typeof this.school_child_array[index_value] !== 'undefined') {
          this.school_child_array[index_value]['isChecked']=true;
        }
      }
    }else{
      var index_value= this.school_child_array.findIndex(obj => obj.id==parseInt(id));
      if(index_value>-1){
        if(typeof this.school_child_array[index_value] !== 'undefined') {
          this.school_child_array[index_value]['isChecked']=false;
        }
      }
    }
  }

  /* Adding class submit button */
  addClass(){
    if(this.type=='add'){
      if(this.classModel.name && this.classModel.name.trim() && this.classModel.schoolId){
        this.classModel.name = this.classModel.name.trim();
        this.onUpload((snap_id_response)=>{
          if(snap_id_response && this.classModel.defaultSnapId){
            this.classModel.defaultSnapId = snap_id_response;
          }else if(snap_id_response){
            this.classModel.defaultSnapId = snap_id_response;
          }
          this.restApiService.putAPI('classroom/add',this.classModel,(response)=>{
            if(response && response['id']){
              this.class_id=response['id'];
              if(this.school_child_array.length>0 && this.class_id){
                this.school_child_array.forEach(element => {
                  if(element.isChecked){
                    this.addSchoolChildToClass(this.class_id,element.id);
                  }
                });
              }
              if(this.school_teacher_array.length>0 && this.class_id){
                this.school_teacher_array.forEach(element => {
                  if(element.isChecked){
                    this.addSchoolTeacherToClass(this.class_id,element.id);
                  }
                });
              }
              this.alertService.showNotification('Class created','success');
              setTimeout(()=>{ this.helperService.goBack();},1000);
            }else if(response && response['message'] && !response['status']){
              this.alertService.showNotification(response['message'],'error');
            }
          });
        });
      }else{
        this.room_name_error=true;
      }
    }else if(this.type=='edit'){
      if(this.classModel.name && this.classModel.name.trim() && this.classModel.schoolId && this.class_id){
        this.classModel['id']=Number(this.class_id);
        this.classModel.name = this.classModel.name.trim();
        this.onUpload((snap_id_response)=>{
          if(snap_id_response && this.classModel.defaultSnapId){
            this.classModel.defaultSnapId = snap_id_response;
          }else if(snap_id_response){
            this.classModel.defaultSnapId = snap_id_response;
          }
          this.restApiService.putAPI('classroom/add',this.classModel,(response)=>{
            if(response && response['id']){
              this.class_id=response['id'];
              if(this.school_child_array.length>0 && this.class_id){
                this.school_child_array.forEach(element => {
                    if(element.isChecked){
                      this.addSchoolChildToClass(this.class_id,element.id);
                    }else{
                      if(this.class_children_array.indexOf(parseInt(element.id))!=-1){
                        this.deleteClassStudent(element.id);
                      }
                    }
                });
              }
  
              if(this.school_teacher_array.length>0 && this.class_id){
                this.school_teacher_array.forEach(element => {
                  if(element.isChecked){
                    this.addSchoolTeacherToClass(this.class_id,element.id);
                  }else{
                    if(this.class_teacher_array.indexOf(parseInt(element.id))!=-1){
                        this.deleteClassTeacher(element.id);
                    }
                  }
                });
              }
              this.alertService.showNotification('Class Updated','success');
              setTimeout(()=>{ this.helperService.goBack(); },1000);
            }else if(response && response['message'] && !response['status']){
              this.alertService.showNotification(response['message'],'error');
            }
          });
        });
      }else{
        this.room_name_error=true;
      }  
    }
  }

  /* Add School Child to school */
  addSchoolChildToClass(class_id,student_id){
    if(class_id && student_id){
      this.restApiService.putAPI('classroomstudent/add/class/'+class_id+'/student/'+student_id,{},(response)=>{
      });
    }
  }

  /* Add Teacher Child to school */
  addSchoolTeacherToClass(class_id,teacher_id){
    if(class_id && teacher_id){
      this.restApiService.putAPI('classroomteacher/add/class/'+class_id+'/teacher/'+teacher_id,{},(response)=>{
      });
    }
  }

  /* Deleting Class Student */
  deleteClassStudent(child_id){
    if(this.class_id && child_id){
      this.restApiService.deleteAPI('classroomstudent/remove/class/'+this.class_id+'/student/'+child_id,(response)=>{
      });
    }
  }

  /* Deleting class Teacher */
  deleteClassTeacher(teacher_id){
    if(this.class_id && teacher_id){
      this.restApiService.deleteAPI('classroomteacher/remove/class/'+this.class_id+'/teacher/'+teacher_id,(response)=>{
      });
    }
  }

  /* File upload required function  start */
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
        this.dpImg_reader_status=true;
        this.dpImg_reader=e.target.result;
      }
      reader.readAsDataURL(this.selectedFile); 
    }
  }
  
  /* Rest API call to upload a file */
  onUpload(callback) {
    if(this.selectedFile && this.user_id && this.school_id){
      this.awsImageuploadService.getSnapIdForAWSUploadedImages({file_data: this.selectedFile,folder:'school-picture/class/'+this.user_id,user_id:this.user_id,school_id:0,type:1},(snap_id_response)=>{
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
    if(this.staticDpImg && this.classModel.defaultSnapId){
      this.staticDpImg = '';
      this.classModel.defaultSnapId = null;
      if(this.classStaticDpImgKey){
        this.awsImageuploadService.deleteFile(this.classStaticDpImgKey,(delete_response)=>{
          if(delete_response){
            this.classStaticDpImgKey = '';
            this.alertService.showNotification('Class Pic Deleted');
          }
        });
      }
    }else if(this.dpImg_reader_status && this.selectedFile){
      this.dpImg_reader_status = false;
      this.selectedFile = null;
      this.dpImg_reader ='';
    }
  }
  /* File upload required function  end*/

  /* 
  * Angular default life cycle method
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

export class Class{
  constructor(
    public name:string='',
    public defaultSnapId:number=null,
    public schoolId:number=0,
  ){}
}
