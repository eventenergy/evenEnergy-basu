import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RestAPIService, AuthenticationService, AlertService } from '../../../_services/index';
import { Subject } from 'rxjs';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { HelperService } from '../../../_helpers/index';
import { GalleryService, Image } from '@ks89/angular-modal-gallery';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';

@Component({
  selector: 'app-user-profile-photo-gallery',
  templateUrl: './user-profile-photo-gallery.component.html',
  styleUrls: ['./user-profile-photo-gallery.component.scss']
})
export class UserProfilePhotoGalleryComponent implements OnInit {
  private unsubscribe$ = new Subject();
  user_id:number;
  user_child_detail_array= new Array();
  selected_user_id:number;
  selected_user_type:string;

  selectedFile: File;
  multiple_images_array = new Array();

  total_files_count:number= 0;
  snap_id_array = new Array();
  file_upload_status:boolean = false;

  canvas_generated_image:HTMLImageElement;
  canvas_width=600;
  canvas_height=400;
  ctx:CanvasRenderingContext2D;
  @ViewChild('canvas') canvas:ElementRef;

  constructor(
    private router:Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService : HelperService,
    private alertService: AlertService,
    private galleryService: GalleryService,
    private awsImageuploadService: AwsImageUploadService
  ) { }

  /* 
  * Angular default lifecycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'User Profile' );//alert service for set title
    
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((check_response)=>{
      if(check_response){
        if(check_response['user'] && check_response['user']['id']){
          obj.user_id = check_response['user']['id'];
          obj.getUserChildDetails(check_response['user']);
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
  * To Get user and Child details 
  */
  getUserChildDetails(user_response){
    this.alertService.showLoader();
    this.user_child_detail_array = [];
    console.log();
    if(user_response && user_response.id && user_response.userProfile){
      try{
        let user=[];
        user['id']=user_response.id;
        if(user_response.userProfile['defaultSnapId']){
          this.restApiService.getData('snap/'+user_response.userProfile['defaultSnapId'],(snap_details_response)=>{
            if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
              user['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
            }
          });
        }else{
          user['staticDpImg']=false;
        }
        user['defaultSnapId']=user_response.userProfile.defaultSnapId;
        user['snaps']=user_response.userProfile.snaps;
        user['isChecked'] = true;
        user['user_type']= 'parent';
        user['firstName']=user_response.userProfile.firstName;
        user['lastName']=user_response.userProfile.lastName;
        var check_id=this.user_child_detail_array.filter((details)=>{ return details.id === user_response.id && details.user_type == 'parent'});
        if(check_id.length==0){
          this.selected_user_id = user_response.id;
          this.selected_user_type = 'parent';
          this.user_child_detail_array.push(user);
          this.showUserImages();
        }
      }catch(e){}    
      // this.restApiService.getData('user/childlist/'+this.user_id,(child_response)=>{
      //   console.log(child_response);
      //   if(child_response && Array.isArray(child_response) && child_response.length > 0){
      //     child_response.forEach(element => {
      //       var check_id=this.user_child_detail_array.filter((details)=>{ return details.id === element.id && details.user_type == 'child'});
      //       if(check_id.length==0){
      //         var child=[];
      //         child['id']=element.id;
      //         if(element['defaultSnapId']){
      //           this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
      //             if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
      //               child['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
      //             }
      //           });
      //         }else{
      //           child['staticDpImg']='';
      //         }
      //         child['defaultSnapId']=element.defaultSnapId;
      //         child['snaps']=element.snaps;
      //         child['isChecked'] = false;
      //         child['user_type']= 'child';
      //         child['firstName']=element.firstName;
      //         child['lastName']=element.lastName;
      //         child['Dob']=element.Dob;
      //         this.user_child_detail_array.push(child);
      //       }
      //     });
      //   }
      //   this.alertService.hideLoader();
      // });

      this.alertService.hideLoader();
    }
  }

  /* 
  * Function to select user who is commenting
  */
  selectUser(user_id, user_type){
    if(this.file_upload_status){
      this.alertService.showNotification('Please wait till upload of images get finish');
      return false;
    }
    if(this.user_child_detail_array && this.user_child_detail_array.length>0){
      this.user_child_detail_array.forEach(element => {
        element.isChecked=false;
      });
      var check_id=this.user_child_detail_array.filter((user)=> { return user.id == user_id && user.user_type == user_type});
      if(check_id.length>0){
        check_id.forEach(element => {
          element.isChecked = true;
          this.selected_user_id = element.id;
          this.selected_user_type = element.user_type;
          this.multiple_images_array.length=0;
          this.showUserImages();
        });
      }
    }
  }

  /* 
  * Function to show user images
  */
  showUserImages(){
    if(this.selected_user_id && this.selected_user_type){
      this.getSelectedUserDetails((user_details)=>{
        this.multiple_images_array = [];
        if(user_details && Array.isArray(user_details) && user_details.length==1){
          user_details.forEach(user_details_element => {
            if(user_details_element.snaps && Array.isArray(user_details_element.snaps) && user_details_element.snaps.length>0){
              user_details_element.snaps.forEach(snap_element => {
                var check_id=this.multiple_images_array.filter((file)=> { return file.snap_id == snap_element.id});
                if(check_id.length==0){
                  this.restApiService.getData('snap/'+snap_element.id,(snap_details_response)=>{
                    console.log(snap_details_response);
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      this.multiple_images_array.push({snap_id:snap_element.id, staticDpImg: AWS_DEFAULT_LINK+snap_details_response.imgPath, user_type:this.selected_user_type, upload_type:true, count:0,relative_path:snap_details_response.imgPath});
                    }
                  });
                }
              });
              this.multiple_images_array=this.multiple_images_array.sort((a,b)=>{ return a.snap_id -  b.snap_id;});
            }
          });
        }
      });
    }
  }

  /* 
  * Function to show user images
  */
  getSelectedUserDetails(callback){
    if(this.selected_user_id && this.selected_user_type){
      this.getUserChildUpdatedProfileDetails((response)=>{
        if(response){
          var check_id=this.user_child_detail_array.filter((user)=> { return user.id == this.selected_user_id && user.user_type == this.selected_user_type && user.isChecked == true});
          if(check_id && Array.isArray(check_id) && check_id.length>0){
            return callback && callback(check_id);
          }else{
            return false;
          }
        }
      });
    }else{
      return false;
    }
  }

  /* 
  * File upload Required function 
  */
  onFileChanged(event){
    if(event && event.target.files){
      let files = event.target.files;
      if (files){
        this.snap_id_array.length = 0;
        // this.total_files_count= files.length;
        let count=0;
        for (let file of files) {
          if(file && this.selected_user_id && this.selected_user_type){
            if(this.helperService.validateFileExtension(file.name) && this.helperService.validateFileSize(file.size)){
              this.file_upload_status = true;
              let reader = new FileReader();
              reader.onload = (e: any) => {
                this.multiple_images_array.push({snap_id:0, staticDpImg:e.target.result, user_type:this.selected_user_type, upload_type:false, count:count,relative_path:''});
                this.uploadAllImagesToAWS(file,count);
                this.total_files_count= count;
                count++;
              }
              reader.readAsDataURL(file);
            }
          }
        }
      }
    }else{
      this.alertService.showNotification('Something went wrong','error');
      return false;
    }
  }

  /* 
  * Save Image to database
  */
  uploadAllImagesToAWS(file: File ,count){
    if(this.selected_user_id && this.selected_user_type){
      this.awsImageuploadService.getSnapDetailsForAWSUploadedImages({file_data:file,folder:'profile-picture/'+this.selected_user_id+'/'+this.selected_user_type,user_id:this.selected_user_id,school_id:0,type:1,snap_id:0,count:0},(snap_id_response)=>{
        if(snap_id_response && snap_id_response.id && snap_id_response.imgPath){
          var check_id=this.snap_id_array.filter((snap)=> { return snap.id == snap_id_response.id});
          if(check_id.length==0){
            this.snap_id_array.push({snap_id:snap_id_response.id,count:count,relative_path:snap_id_response.imgPath})
          }
          if(this.snap_id_array.length > 0 && this.total_files_count > 0 && this.snap_id_array.length == this.total_files_count){
            this.saveImageToDb();
          }
        }
      });
    }
  }

  private saveImageToDb(){
    if(this.snap_id_array.length > 0 && this.total_files_count > 0 && this.snap_id_array.length == this.total_files_count){
      this.getSelectedUserDetails((user_details)=>{
        if(user_details && Array.isArray(user_details) && user_details.length==1){
          user_details.forEach(user_details_element => {
            let snaps_array=[];
            if(user_details_element.snaps && Array.isArray(user_details_element.snaps) && user_details_element.snaps.length>0){
              user_details_element.snaps.forEach(snap_element => {
                var check_id=snaps_array.filter((snap)=> { return snap == snap_element.id});
                if(check_id.length==0){
                  snaps_array.push(snap_element.id)
                }
              });
            }
            
            this.snap_id_array.forEach(snap_id_check_array => {
              var check_snap_id=snaps_array.filter((snap)=> { return snap == snap_id_check_array.snap_id});
              if(check_snap_id.length==0){
                snaps_array.push(snap_id_check_array.snap_id)
              }
            });
            
            if(this.selected_user_type == 'parent'){
              let parent_details={
                "id": user_details_element.id,
                "firstName" : user_details_element.firstName,
                "lastName" : user_details_element.lastName,
                "defaultSnapId" : user_details_element.defaultSnapId,
                "dpImgSnapIds": snaps_array
              }
              this.restApiService.postAPI('user/updateProfile',parent_details,(user_update_response)=>{
                if(user_update_response && user_update_response['id']){
                  this.snap_id_array.forEach(snap_element => {
                    var check_id_index=this.multiple_images_array.findIndex((snap)=>{ return snap.snap_id == 0 && !snap.upload_type && snap.count == snap_element.count && snap.user_type == this.selected_user_type; });
                    var check_duplicate_id=this.multiple_images_array.filter((file)=> { return file.snap_id == snap_element.snap_id});
                    if(check_id_index>-1 && check_duplicate_id.length==0){
                      this.multiple_images_array.splice(check_id_index,1,{snap_id:snap_element.snap_id, staticDpImg:AWS_DEFAULT_LINK+snap_element.relative_path, user_type:this.selected_user_type,upload_type:true, count:0, relative_path:snap_element.relative_path});
                    }
                  });
                  this.alertService.showAlertBottomNotification('Uploaded');
                  this.file_upload_status = false;
                }else if(user_update_response && user_update_response['message'] && !user_update_response['success']){
                  this.file_upload_status = false;
                  this.alertService.showNotification('Something went wrong, please try again', 'error');
                  return false;
                }else{
                  this.file_upload_status = false;
                  this.alertService.showNotification('Something went wrong, please try again', 'error');
                  return false;
                }
              });
            } 
            else if(this.selected_user_type == 'child' && this.user_id){
              let child_details={
                "id":user_details_element.id,
                "firstName" : user_details_element.firstName,
                "lastName" : user_details_element.lastName,
                "status":true,
                "assignedUsers": [this.user_id],
                "defaultSnapId" : user_details_element.defaultSnapId,
                "dpImgSnapIds": snaps_array
              }
              this.restApiService.postAPI('parent/addChild',child_details,(parent_addchild_response)=>{
                if(parent_addchild_response && parent_addchild_response['id']){
                  this.snap_id_array.forEach(snap_element => {
                    var check_id_index=this.multiple_images_array.findIndex((snap)=>{ return snap.snap_id == 0 && !snap.upload_type && snap.count == snap_element.count && snap.user_type == this.selected_user_type; });
                    var check_duplicate_id=this.multiple_images_array.filter((file)=> { return file.snap_id == snap_element.snap_id});
                    if(check_id_index>-1 && check_duplicate_id.length==0){
                      this.multiple_images_array.splice(check_id_index,1,{snap_id:snap_element.snap_id, staticDpImg:AWS_DEFAULT_LINK+snap_element.relative_path, user_type:this.selected_user_type,upload_type:true, count:0, relative_path:snap_element.relative_path});
                    }
                  });
                  this.alertService.showAlertBottomNotification('Uploaded');
                  this.file_upload_status = false;
                }else if(parent_addchild_response && parent_addchild_response['message'] && !parent_addchild_response['success']){
                  this.alertService.showNotification('Something went wrong, please try again', 'error');
                  this.file_upload_status = false;
                  return false;
                }else{
                  this.alertService.showNotification('Something went wrong, please try again', 'error');
                  this.file_upload_status = false;
                  return false;
                }
              });
            }
          });
        }
      });
    }
  }

  /* 
  * Function to return user or child profile updated details
  */
  getUserChildUpdatedProfileDetails(callback){
    if(this.selected_user_id && this.selected_user_type=='parent'){
      this.restApiService.getData('user/'+this.selected_user_id,(user_response)=>{
        if(user_response && user_response.id && user_response.userProfile){
          try{
            let user=[];
            user['id']=user_response.id;
            if(user_response.userProfile['defaultSnapId']){
              this.restApiService.getData('snap/'+user_response.userProfile['defaultSnapId'],(snap_details_response)=>{
                if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                  user['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                }
              });
            }else{
              user['staticDpImg']=false;
            }
            user['defaultSnapId']=user_response.userProfile.defaultSnapId;
            user['snaps']=user_response.userProfile.snaps;
            user['isChecked'] = true;
            user['user_type']= 'parent';
            user['firstName']=user_response.userProfile.firstName;
            user['lastName']=user_response.userProfile.lastName;
            var check_id_index=this.user_child_detail_array.findIndex((details)=>{ return details.id === user_response.id && details.user_type == 'parent'});
            if(check_id_index>-1){
              if(typeof this.user_child_detail_array[check_id_index] !== 'undefined'){
                this.user_child_detail_array[check_id_index]['snaps'] = user_response.userProfile.snaps;
                // this.user_child_detail_array.splice(check_id_index,1,user);
                return callback && callback(this.user_child_detail_array[check_id_index]);
              }
              return callback && callback([]);
            }
          }catch(e){}
        }
      });
    }
    else if(this.selected_user_id && this.selected_user_type=='child'){
      this.restApiService.getData('user/child/'+this.selected_user_id,(child_response)=>{
        if(child_response && child_response.id){
          var child=[];
          child['id']=child_response.id;
          if(child_response['defaultSnapId']){
            this.restApiService.getData('snap/'+child_response['defaultSnapId'],(snap_details_response)=>{
              if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                child['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
              }
            });
          }else{
            child['staticDpImg']=false;
          }
          child['defaultSnapId']=child_response.defaultSnapId;
          child['snaps']=child_response.snaps;
          child['isChecked'] = true;
          child['user_type']= 'child';
          child['firstName']=child_response.firstName;
          child['lastName']=child_response.lastName;
          child['Dob']=child_response.Dob;
          var check_id_index=this.user_child_detail_array.findIndex((details)=>{ return details.id === child_response.id && details.user_type == 'child'});
          if(check_id_index>-1){
            if(typeof this.user_child_detail_array[check_id_index] !== 'undefined'){
              this.user_child_detail_array[check_id_index]['snaps']= child_response.snaps;
              // this.user_child_detail_array.splice(check_id_index,1,child);
              return callback && callback(this.user_child_detail_array[check_id_index]);
            }
            return callback && callback([]);
          }
        }
      });
    }
  }

  /*
  * Function to show image dropdown to give option
  */
  showGalleryImagesDropDown(snap_id){
    if(snap_id){
      this.multiple_images_array.forEach(element => {
        if(element.snap_id != snap_id){
          document.getElementById('gallery_image_dropdown_'+element.snap_id).style.display = 'none';
        }
      });
      if(document.getElementById('gallery_image_dropdown_'+snap_id)){
        document.getElementById('gallery_image_dropdown_'+snap_id).style.display == 'none' ? document.getElementById('gallery_image_dropdown_'+snap_id).style.display = 'block' : document.getElementById('gallery_image_dropdown_'+snap_id).style.display = 'none'
      }
    }
  }

  /*
  * Function to delete gallery snap
  */
  deleteSnapOrSetDefaultSnap(snap_id,relative_path,user_type,action_type){
    this.getSelectedUserDetails((user_details)=>{
      if(user_details && Array.isArray(user_details) && user_details.length==1){
        user_details.forEach(user_details_element => {
          let snaps_array=[];
          if(user_details_element.snaps && Array.isArray(user_details_element.snaps) && user_details_element.snaps.length>0){
            user_details_element.snaps.forEach(snap_element => {
              var check_id=snaps_array.filter((snap)=> { return snap == snap_element.id});
              if(check_id.length==0){
                snaps_array.push(snap_element.id)
              }
            });
          }
          if(action_type=='delete'){
            var check_snap_index=snaps_array.findIndex((snap)=> { return snap.id == snap_id});
            if(check_snap_index>-1){
              snaps_array.splice(check_snap_index,1);
            }
            this.updateProfile(user_details_element,user_type,action_type,snaps_array,snap_id,relative_path);
          }else if(action_type=='set_profile'){
            user_details_element.defaultSnapId = 0;
            this.restApiService.downloadAWSFile(AWS_DEFAULT_LINK+relative_path,(response)=>{
              if(response){
                this.awsImageuploadService.getSnapIdForAWSUploadedImages({file_data: response,folder:'profile-picture/'+this.user_id,user_id:this.user_id,school_id:0,type:1},(snap_id_response)=>{
                  if(snap_id_response){
                    user_details_element.defaultSnapId = snap_id_response;
                    this.updateProfile(user_details_element,user_type,action_type,snaps_array,snap_id,relative_path);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  private updateProfile(user_details_element,user_type,action_type,snaps_array,snap_id,relative_path){
    if(user_details_element && user_type && action_type && snaps_array && snap_id && relative_path){
      if(this.selected_user_type == 'parent' && user_type=='parent'){
        let parent_details={
          "id": user_details_element.id,
          "firstName" : user_details_element.firstName,
          "lastName" : user_details_element.lastName,
          "defaultSnapId" : user_details_element.defaultSnapId,
          "dpImgSnapIds": snaps_array
        }
        this.restApiService.postAPI('user/updateProfile',parent_details,(user_update_response)=>{
          if(user_update_response && user_update_response['id']){
            if(action_type=='delete'){
              var check_id_index=this.multiple_images_array.findIndex((snap)=>{ return snap.snap_id == snap_id && snap.user_type == this.selected_user_type; });
              if(check_id_index>-1){
                this.multiple_images_array.splice(check_id_index,1);
              }
              if(user_details_element.defaultSnapId != snap_id){
                this.deleteSnap(snap_id,relative_path);
              }
              this.alertService.showAlertBottomNotification('Deleted');
            }else if(action_type=='set_profile'){
              if(document.getElementById("gallery_image_dropdown_"+snap_id)){
                document.getElementById('gallery_image_dropdown_'+snap_id).style.display= 'none';
              }
              // this.getSelectedUserDetails((response)=>{});
              this.authenticateService.pushUpdatedDetails();
              this.alertService.showAlertBottomNotification('Default profile pic updated');
            }
          }else if(user_update_response && user_update_response['message'] && !user_update_response['success']){
            this.alertService.showNotification('Something went wrong, please try again', 'error');
            return false;
          }else{
            this.alertService.showNotification('Something went wrong, please try again', 'error');
            return false;
          }
        });
      } 
      else if(this.selected_user_type == 'child' && this.user_id){
        let child_details={
          "id":user_details_element.id,
          "firstName" : user_details_element.firstName,
          "lastName" : user_details_element.lastName,
          "status":true,
          "assignedUsers": [this.user_id],
          "defaultSnapId" : user_details_element.defaultSnapId,
          "dpImgSnapIds": snaps_array
        }
        this.restApiService.postAPI('parent/addChild',child_details,(parent_addchild_response)=>{
          if(parent_addchild_response && parent_addchild_response['id']){
            if(action_type=='delete'){
              var check_id_index=this.multiple_images_array.findIndex((snap)=>{ return snap.snap_id == snap_id && snap.user_type == this.selected_user_type; });
              if(check_id_index>-1){
                this.multiple_images_array.splice(check_id_index,1);
                if(user_details_element.defaultSnapId != snap_id){
                  this.deleteSnap(snap_id,relative_path);
                }
                this.alertService.showAlertBottomNotification('Deleted');
              }
            }else if(action_type=='set_profile'){
              if(document.getElementById("gallery_image_dropdown_"+snap_id)){
                document.getElementById("gallery_image_dropdown_"+snap_id).style.display = 'none';
              }
              // this.getSelectedUserDetails((response)=>{});
              this.authenticateService.pushUpdatedDetails();
              this.alertService.showAlertBottomNotification('Default profile pic updated');
            }
          }else if(parent_addchild_response && parent_addchild_response['message'] && !parent_addchild_response['success']){
            this.alertService.showNotification('Something went wrong, please try again', 'error');
            return false;
          }else{
            this.alertService.showNotification('Something went wrong, please try again', 'error');
            return false;
          }
        });
      }
    }
  }

  /*
  * Function to call rest API to delete snap
  */
  deleteSnap(snap_id,relative_path){
    if(snap_id){
      this.restApiService.deleteAPI('snap/'+snap_id,(response)=>{
        if(relative_path){
          this.awsImageuploadService.deleteFile(relative_path,(response)=>{})
        }
      });
    }
  }
  /*
  * Default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /*
  * Modal gallery popup
  */
  modal_images: Image[] = [];
  openImageModal(image_array,snap_id){
    this.modal_images =  [];
    if(image_array && Array.isArray(image_array) && image_array.length>0 && snap_id){
      image_array.forEach(element => {
        if(element.snap_id && element.upload_type && element.staticDpImg){
          var check_id=this.modal_images.filter((details)=>{ return details.id === element.snap_id});
          if(check_id.length==0){
            const newImage: Image = new Image(element.snap_id, {'img':element.staticDpImg});
            this.modal_images.push(newImage);
            this.galleryService.updateGallery(1,this.modal_images.length-1+1,newImage)
          }
        }
      });
      var checked_index_value= this.modal_images.findIndex(obj => obj.id == snap_id);
      if(checked_index_value>-1){
        setTimeout(()=>{this.galleryService.openGallery(1,checked_index_value);},1);
      }
    }
  }

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event){
    this.helperService.updateDefaultImageUrlHelper(event);
  }

}
