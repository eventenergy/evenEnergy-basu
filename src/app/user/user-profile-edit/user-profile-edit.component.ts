import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { User } from '../user';
import { AWS_DEFAULT_LINK } from '../../config';
import { Router } from '@angular/router';
import { RestAPIService, AuthenticationService, AlertService } from '../../_services';
import { HelperService } from '../../_helpers';
import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
declare let $: any;

@Component({
  selector: 'app-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.scss']
})
export class UserProfileEditComponent implements OnInit {
  private unsubscribe$ = new Subject();
  user_id: number;
  userModel = new User();
  selectedFile: File;
  userStaticDpImg: string;
  userStaticDpImgKey: string;
  school_list_array = new Array();
  image_reader: boolean = false;
  image_reader_url;
  imageChangedEvent: any;
  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  @ViewChild('fileInput2') fileInput: ElementRef;

  constructor(
    private router: Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService: HelperService,
    private alertService: AlertService,
    private awsImageuploadService: AwsImageUploadService
  ) {
  }

  /*
  * Default life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle('Edit Profile');//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((check_response) => {
      if (check_response) {
        if (check_response['user'] && check_response['user']['id']) {
          obj.restApiService.getData('user/' + check_response['user']['id'], (response) => {
            if (response && response['id'] && response['userProfile']) {
              obj.userModel = new User(response['id'], response['userProfile']['firstName'],
                response['userProfile']['lastName'], true,
                response['mobile'], response['email'],
                response['userProfile']['defaultSnapId']
              );
              if (response['userProfile']['defaultSnapId']) {
                this.restApiService.getData('snap/' + response['userProfile']['defaultSnapId'], (snap_details_response) => {
                  if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                    obj.userStaticDpImg = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                    obj.userStaticDpImgKey = snap_details_response.imgPath;
                  }
                });
              }
              obj.user_id = response['id'];
            }
          });
        } else {
          return obj.router.navigate(['/login']);
        }
      } else {
        if (localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')) {
          obj.authenticateService.checkExpiryStatus();
        }
        return obj.router.navigate(['/login']);
      }
    });
  }

  /*
  * Set Password display
  */
  setpassword() {
    $("#change_password").show();
    $("#change_button").hide();
  }

    /*
    * Save User Details form
    */
  saveUserDetails(form: NgForm) {
    if (form && form.status == 'VALID') {
      if (this.userModel.id !== 0) {
        var email_pattern = new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
        if (this.userModel.firstName && this.userModel.firstName.trim() && this.userModel.lastName && this.userModel.lastName.trim() && this.userModel.email && this.userModel.email.trim() && email_pattern.test(this.userModel.email.trim()) && this.userModel.id && this.userModel.mobile && this.userModel.mobile.internationalNumber) {
          this.restApiService.postAPI('user/update', { 'id': this.userModel.id, 'email': this.userModel.email.trim(), 'mobile': this.userModel.mobile.internationalNumber.replace(/ /g, "") }, (user_update_response) => {
            if (user_update_response && user_update_response['id']) {
              this.onUpload((snap_id_response) => {
                if (snap_id_response) {
                  let snap_id = snap_id_response;
                  if (snap_id) {
                    this.userModel.defaultSnapId = snap_id;
                  }
                }
                this.restApiService.postAPI('user/updateProfile', { 'id': this.userModel.id, 'firstName': this.userModel.firstName.trim(), 'lastName': this.userModel.lastName.trim(), 'status': this.userModel.status, 'defaultSnapId': this.userModel.defaultSnapId }, (user_profile_response) => {
                  if (user_profile_response && user_profile_response['id']) {
                    this.alertService.showAlertBottomNotification('Profile updated');
                    this.authenticateService.pushUpdatedDetails();
                    setTimeout(() => { this.helperService.goBack(); }, 1000);
                  } else if (user_profile_response && user_profile_response['message'] && !user_profile_response['success']) {
                    this.alertService.showNotification(user_profile_response['message'], 'error');
                  } else {
                    this.alertService.showNotification('Something went wrong', 'error');
                  }
                });
              })
            } else if (user_update_response && user_update_response['message'] && !user_update_response['success']) {
              this.alertService.showNotification(user_update_response['message'], 'error');
            }
          });
        } else {
          this.alertService.showNotification('One or more field is required', 'error');
          return false;
        }
      }
    } else {
      this.alertService.showNotification('One or more field is required', 'error');
    }
  }

  /*
  * Cancel Button function to go back
  */
  goBack() {
    this.helperService.goBack();
  }

  /* File upload Required function */
  onFileChanged(event) {
    this.selectedFile = event;
    this.fileInput.nativeElement.value = null;
    if (this.selectedFile) {
      if (!this.helperService.validateFileExtension(this.selectedFile.name)) {
        this.alertService.showNotification('Selected file format is not supported', 'error')
        return false;
      }
      if (!this.helperService.validateFileSize(this.selectedFile.size)) {
        this.alertService.showNotification('Selected file size is more', 'error')
        return false;
      }
      this.image_reader = true;
      var reader = new FileReader();
      reader.readAsDataURL(event);
      reader.onload = (event: any) => {
        this.image_reader_url = event.target.result;
      }
    }
  }

  onFileChanged2(event) {
    console.log('onFileChanged ', event);
    this.imageChangedEvent = event;
  }

  /* Rest API call to upload a file */
  onUpload(callback) {
    if (this.selectedFile && this.user_id) {
      this.awsImageuploadService.getSnapIdForAWSUploadedImages({ file_data: this.selectedFile, folder: 'profile-picture/' + this.user_id, user_id: this.user_id, school_id: 0, type: 1 }, (snap_id_response) => {
        if (snap_id_response) {
          return callback && callback(snap_id_response);
        } else {
          return callback && callback(0);
        }
      });
    } else {
      return callback && callback(0);
    }
  }

  /*
  * Delete Profile photo
  */
  deleteProfileImage() {
    if (this.userStaticDpImg && this.userModel.defaultSnapId) {
      $('#alert_delete_profile_pic_popup').modal('show');
    } else if (this.image_reader && this.selectedFile) {
      this.image_reader = false;
      this.selectedFile = null;
      this.image_reader_url = '';
    }
  }

  deleteProfileImageFromDB() {
    if (this.userStaticDpImg && this.userModel.defaultSnapId) {
      this.userStaticDpImg = '';
      this.restApiService.postAPI('user/updateProfile', { 'id': this.userModel.id, 'firstName': this.userModel.firstName.trim(), 'lastName': this.userModel.lastName.trim(), 'status': this.userModel.status, 'defaultSnapId': null }, (user_profile_response) => {
        if (user_profile_response && user_profile_response['id']) {
          $('#alert_delete_profile_pic_popup').modal('hide');
          this.restApiService.deleteAPI('snap/' + this.userModel.defaultSnapId, (response) => {
            this.userModel.defaultSnapId = null;
          });
          this.alertService.showNotification('Profile Pic Deleted');
          if (this.userStaticDpImgKey) {
            this.awsImageuploadService.deleteFile(this.userStaticDpImgKey, (delete_response) => {
              if (delete_response) {
                this.userStaticDpImgKey = '';
              }
            });
          }
        }
      });
    }
  }

  /*
  * Default life cycle method
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }

  /*
  * Check input type
  */
  numberOnly(event): boolean {
    if (event.target.value) {
      event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
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
  updateDefaultImageUrl(event) {
    this.helperService.updateDefaultImageUrlHelper(event);
  }

}
