import { Component, OnInit } from '@angular/core';
import { AWS_DEFAULT_LINK } from '../../config';

import { UserBankAccount } from './userbankaccount';
import { Router } from '@angular/router';
import { RestAPIService, AuthenticationService, AlertService, DataService } from '../../_services';
import { HelperService } from '../../_helpers';
import { Subject } from 'rxjs';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';

declare let $: any;
@Component({
  selector: 'app-user-profile-bank-account',
  templateUrl: './user-profile-bank-account.component.html',
  styleUrls: ['./user-profile-bank-account.component.scss']
})
export class UserProfileBankAccountComponent implements OnInit {
  private unsubscribe$ = new Subject();
  userBankAccountModel = new UserBankAccount();
  type: string = 'add';
  id: number = 0;
  user_id: number;
  school_id: number;
  account_name_error: boolean = false;
  account_number_error: boolean = false;
  bank_name_error: boolean = false;
  branch_error: boolean = false;
  ifsc_error: boolean = false;
  gst_no_error: boolean = false;
  pan_no_error: boolean = false;
  tagged_snap_id_array = new Array();
  snaps_array = new Array();
  selectedFile: File;
  staticDpImg: string;
  dpImg_reader_status: boolean = false;
  dpImg_reader: string;
  constructor(
    private router: Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService: HelperService,
    private dataService: DataService,
    private alertService: AlertService,
    private awsImageuploadService: AwsImageUploadService) {

    if (this.dataService.hasUserId()) {
      this.user_id = this.dataService.hasUserId();
    } else {
      this.helperService.goBack();
    }
    if (this.dataService.hasSchoolId()) {
      this.school_id = this.dataService.hasSchoolId();
    }

  }
  /*
    * Default Angular Life cycle method
    */
  ngOnInit() {
    this.alertService.setTitle('Bank Details');//alert service for set title
    this.userBankAccountModel = new UserBankAccount();
    this.userBankAccountModel.accountType = 0;
    console.log(this.user_id);
    if (this.user_id) {
      this.restApiService.getData('user/bankAccount/' + this.user_id, (bank_response) => {
        console.log(bank_response);
        if (bank_response && Array.isArray(bank_response) && bank_response.length > 0) {
          this.type = 'edit';
          var element = bank_response[0];  // temp use later ll use 1:N
          if (element && element['id']) {
            this.id = element['id'];
            this.userBankAccountModel.accountHolderName = element['accountHolderName'];
            this.userBankAccountModel.accountNumber = element['accountNumber'];
            this.userBankAccountModel.branchName = element['branchName'];
            this.userBankAccountModel.bankName = element['bankName'];
            this.userBankAccountModel.ifscCode = element['ifscCode'];
            this.userBankAccountModel.gstNumber = element['gstNumber'];
            this.userBankAccountModel.panNumber = element['panNumber'];
            this.userBankAccountModel.accountType = element['accountType'];
            console.log(element['accountType'] + " AT");
            if (element.snaps && Array.isArray(element.snaps) && element.snaps.length > 0) {
              element.snaps.forEach(snap => {
                if (snap && snap.id) {
                  var doc = [];
                  doc['id'] = snap.id;
                  doc['imgPath'] = AWS_DEFAULT_LINK + snap.imgPath;
                  doc['imgKey'] = snap.imgPath;
                  doc['type'] = snap.type;
                  doc['caption'] = snap.caption ? snap.caption : '';
                  this.snaps_array.push(doc);
                  this.tagged_snap_id_array.push(snap.id);
                }
              });
            }
          }
        }
      });
    } else {
      this.alertService.showNotification('Something went wrong', 'error');
    }

  }
  /*
  * Cancel Button function to go back
  */
  goBack() {
    this.helperService.goBack();
  }
  /*
  * Save User Bank Account
  */
  saveUserBankAccountDetails() {
    if (this.user_id && this.school_id) {
      if (this.userBankAccountModel.accountHolderName && this.userBankAccountModel.accountNumber.trim() && this.userBankAccountModel.bankName && this.userBankAccountModel.branchName.trim()
        && this.userBankAccountModel.ifscCode && this.userBankAccountModel.gstNumber && this.userBankAccountModel.panNumber) {
        //alert(this.type + this.id);
        if (this.type == 'add') {
          var bank_acc_details = {
            "id": 0,
            "accountNumber": this.userBankAccountModel.accountNumber,
            "accountHolderName": this.userBankAccountModel.accountHolderName,
            "bankName": this.userBankAccountModel.bankName,
            "branchName": this.userBankAccountModel.branchName,
            "ifscCode": this.userBankAccountModel.ifscCode,
            "gstNumber": this.userBankAccountModel.gstNumber,
            "panNumber": this.userBankAccountModel.panNumber,
            "userId": this.user_id,
            "schoolId": this.school_id,
            "taggedSnaps": this.tagged_snap_id_array,
            "accountType": this.userBankAccountModel.accountType
          }
          this.restApiService.postAPI('user/updateBankAccount', bank_acc_details, (bank_acc_response) => {
            console.log(bank_acc_response);
            if (bank_acc_response && bank_acc_response['id']) {
              this.alertService.showAlertBottomNotification('Account Added');
              this.id = bank_acc_response['id'];
              this.type = 'edit';
              var resetForm = <HTMLFormElement>document.getElementById('userBankAccountForm');
              resetForm.reset();
              setTimeout(() => { this.helperService.goBack(); }, 1000);
            } else if (bank_acc_response['success'] == false) {
              this.alertService.showNotification(bank_acc_response['message'], 'error');
            } else {
              this.alertService.showNotification('Something went wrong', 'error');
            }
          });
        } else if (this.type == 'edit') {
          bank_acc_details = {
            "id": this.id,
            "accountNumber": this.userBankAccountModel.accountNumber,
            "accountHolderName": this.userBankAccountModel.accountHolderName,
            "bankName": this.userBankAccountModel.bankName,
            "branchName": this.userBankAccountModel.branchName,
            "ifscCode": this.userBankAccountModel.ifscCode,
            "gstNumber": this.userBankAccountModel.gstNumber,
            "panNumber": this.userBankAccountModel.panNumber,
            "userId": this.user_id,
            "schoolId": this.school_id,
            "taggedSnaps": this.tagged_snap_id_array,
            "accountType": this.userBankAccountModel.accountType
          }
          this.restApiService.postAPI('user/updateBankAccount', bank_acc_details, (bank_acc_response) => {
            if (bank_acc_response && bank_acc_response['id']) {
              this.alertService.showAlertBottomNotification('Account Updated')
              // var resetForm = <HTMLFormElement>document.getElementById('userBankAccountForm');
              // resetForm.reset();
              setTimeout(() => { this.helperService.goBack(); }, 1000);
            } else if (bank_acc_response['success'] == false) {
              this.alertService.showNotification(bank_acc_response['message'], 'error');
            } else {
              this.alertService.showNotification('Something went wrong', 'error');
            }
          });
        }

      } else {
        (!this.userBankAccountModel.accountHolderName || (this.userBankAccountModel.accountHolderName && !this.userBankAccountModel.accountHolderName.trim())) ? this.account_name_error = true : this.account_name_error = false;
        (!this.userBankAccountModel.accountNumber || (this.userBankAccountModel.accountNumber && !this.userBankAccountModel.accountNumber.trim())) ? this.account_number_error = true : this.account_number_error = false;
        (!this.userBankAccountModel.branchName || (this.userBankAccountModel.branchName && !this.userBankAccountModel.branchName.trim())) ? this.branch_error = true : this.branch_error = false;
        (!this.userBankAccountModel.bankName || (this.userBankAccountModel.bankName && !this.userBankAccountModel.bankName.trim())) ? this.bank_name_error = true : this.bank_name_error = false;
        (!this.userBankAccountModel.ifscCode || (this.userBankAccountModel.ifscCode && !this.userBankAccountModel.ifscCode.trim())) ? this.ifsc_error = true : this.ifsc_error = false;
        (!this.userBankAccountModel.gstNumber || (this.userBankAccountModel.gstNumber && !this.userBankAccountModel.gstNumber.trim())) ? this.gst_no_error = true : this.gst_no_error = false;
        (!this.userBankAccountModel.panNumber || (this.userBankAccountModel.panNumber && !this.userBankAccountModel.panNumber.trim())) ? this.pan_no_error = true : this.pan_no_error = false;

      }
    } else {
      this.alertService.showNotification('Something went wrong', 'error');
    }
  }
  /*
      * Default life cycle method
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

  /* File upload Required function */
  onFileChanged(event, caption) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      if (!this.helperService.validateUploadedFileExtension(this.selectedFile.name)) {
        this.alertService.showNotification('Selected file format is not supported', 'error');
        return false;
      }
      if (!this.helperService.validateFileSize(this.selectedFile.size)) {
        this.alertService.showNotification('Selected file size is more', 'error');
        return false;
      }
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.staticDpImg = null;
        this.dpImg_reader_status = true;
        this.dpImg_reader = e.target.result;
      }
      reader.readAsDataURL(this.selectedFile);
      this.onUpload(caption);
    }
  }

  /* Rest API call to upload a file */
  onUpload(caption) {
    // need to set type 0 or 1    0-pdf, 1-image
    var fileType = this.helperService.getFileType(this.selectedFile.name);

    /* need to do 
    if(this.childStaticDpImgKey){
      this.awsImageuploadService.deleteFile(this.childStaticDpImgKey,(delete_response)=>{
        if(delete_response){
          this.childStaticDpImgKey = '';
          this.alertService.showNotification('Child Pic Deleted');
        }
      });
    } */
    if (this.selectedFile && this.user_id) {
      this.awsImageuploadService.getSnapIdForAWSUploadedImages({ file_data: this.selectedFile, folder: 'user-profile/bank/' + this.school_id, user_id: this.user_id, school_id: this.school_id, type: fileType, caption: caption }, (snap_id_response) => {
        if (snap_id_response) {

          
          this.restApiService.getData('snap/' + snap_id_response, (resp) => {
            if (resp && resp.id) {
              //remove corresponding files if already present
              var id = this.findSnapId(resp.caption);
              if (id != -1) { console.log('found matching id at id, ', id); this.removeSnapAssociation(id); }
              
              //push uploaded snap into snaps_array
              var doc = [];
              doc['id'] = resp.id;
              doc['imgPath'] = AWS_DEFAULT_LINK + resp.imgPath;
              doc['imgKey'] = resp.imgPath;
              doc['type'] = resp.type;
              doc['caption'] = resp.caption ? resp.caption : '';
              this.snaps_array.push(doc);
            }
          })
          this.tagged_snap_id_array.push(snap_id_response);
        } else {
          return "";
        }
      });
    } else {
      return "";
    }
  }

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event) {
    this.helperService.updateDefaultImageUrlHelper(event);
  }

  deleteSnap(snap) {
    this.restApiService.deleteAPI('snap/' + snap.id, (resp) => console.log(resp));
    this.removeSnapAssociation(snap.id);
    // this.awsImageuploadService.deleteFile(snap.imgKey, (resp)=>{console.log(resp)});"taggedSnaps": this.tagged_snap_id_array
    // this.restApiService.postAPI('user/updateBankAccount', { id: this.id, taggedSnaps: this.tagged_snap_id_array }, (resp) => { console.log(resp) })
  }

  removeSnapAssociation(snapId) {
    var snapIndex = this.snaps_array.findIndex((snap) => { return snap.id == snapId });
    if (snapIndex != -1) this.snaps_array.splice(snapIndex, 1);
    if (snapIndex != -1) console.log("found index at ,", snapIndex);

    var snapIndex2 = this.tagged_snap_id_array.indexOf(snapId);
    if (snapIndex2 != -1) console.log("found index 2 at ,", snapIndex2);
    if (snapIndex2 != -1) this.tagged_snap_id_array.splice(snapIndex2, 1);

  }

  findSnapId(caption) {
    var snap = this.snaps_array.find((snap) => { return snap.caption == caption });
    if (snap) return snap.id;
    else return -1;
  }
}
