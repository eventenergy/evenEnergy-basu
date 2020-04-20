import { Injectable } from '@angular/core';

import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import { RestAPIService } from './rest-api.service';
import { AwsImageUploadProgressService } from './aws-image-upload-progress.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class AwsImageUploadService {

  BUCKET = 'images-story-twinkle';
  FOLDER = 'images/';
  temp = 'QUtJQVFaNE1JUElJS0NKUlBZMk8=';
  temp2 = 'ajBKdVdLbnhiVll6OXVYa2xzbG9odzIvZjFWVzRldUZLUGZ5M0M0Qw==';
  constructor(
    private restApiService: RestAPIService,
    private awsUploadProgressService: AwsImageUploadProgressService,
    private alertService: AlertService,
  ) { }

  private getS3Bucket(): any {
    const bucket = new S3(
      {
        accessKeyId: atob(this.temp),
        secretAccessKey: atob(this.temp2),
        region: 'ap-south-1'
      }
      
    );
    return bucket;
  }

  uploadFileToAWS(file: File,folder,count,callback){
    if(file && folder){
      const contentType = file.type;
      const date = new Date().valueOf();
      let text = '';
      const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 10; i++) {
        text += possibleText.charAt(Math.floor(Math.random()*possibleText.length) );
      }
      var extension = '';
      if(contentType){
        extension = contentType.split('/')[1];
      }
      const imageName = text +'_'+ date + '.'+extension;

      const params = {
          Bucket: this.BUCKET,
          Key: folder +'/'+ imageName,
          Body: file,
          ACL: 'public-read',
          ContentType: contentType
      };
      // this.getS3Bucket().upload(params, function (err, data) {
      //   if(err){
      //     return callback && callback(false);
      //   }
      //     return callback && callback(data);
      // });
      
      var options = {partSize: 40 * 1024 * 1024, queueSize: 1};
      this.getS3Bucket().upload(params,options).on('httpUploadProgress', (evt)=> {
        if(evt && evt.key && evt.loaded && evt.total){
          let total_progress= parseInt(((evt.loaded/evt.total) * 100).toString());
          this.awsUploadProgressService.addUploadProgressItem({count:count, key:evt.key, percentage:total_progress })
        }
      }).send(function (err, data) {
        if(err){
          // this.alertService.hideLoader();
          return callback && callback(false);
        }
          return callback && callback(data);
      });

    //for upload progress
    /*bucket.upload(params).on('httpUploadProgress', function (evt) {
          console.log(evt.loaded + ' of ' + evt.total + ' Bytes');
      }).send(function (err, data) {
          if (err) {
              console.log('There was an error uploading your file: ', err);
              return false;
          }
          console.log('Successfully uploaded file.', data);
          return true;
      });*/
    }
  }

  deleteFile(file_name,callback) {
    const params = {
      Bucket: this.BUCKET,
      Key: file_name
    };
 
    this.getS3Bucket().deleteObject(params, function (err, data) {
      if (err) {
        return callback && callback(false);
      }
      return callback && callback(true);
    });
  }

  getSnapIdForAWSUploadedImages({file_data,folder,user_id,school_id,type, caption=''},callback){
    this.uploadFileToAWS(file_data,folder,0, (aws_image_upload_response)=>{
      if(aws_image_upload_response && aws_image_upload_response.Location && aws_image_upload_response.key){
        let snap_details = {
          "schoolId" :school_id,
          "userId" : user_id,
          "imgPath" : aws_image_upload_response.key,
          "type": type,
          "caption": caption
        };
        this.restApiService.postAPI('snap/add',snap_details,(response)=>{
          if(response && response.id){
            return callback && callback(response.id);
          }else{
            return callback && callback(0);
          }
        });
      }else{
        return callback && callback(0);
      }
    });
  }

  getSnapDetailsForAWSUploadedImages({file_data,folder,user_id,school_id,type,snap_id,count},callback){
    this.uploadFileToAWS(file_data,folder,count,(aws_image_upload_response)=>{
      if(aws_image_upload_response && aws_image_upload_response.Location && aws_image_upload_response.key){
        let snap_details = {
          "schoolId" :school_id,
          "userId" : user_id,
          "imgPath" : aws_image_upload_response.key,
          "type": type,
        };
        if(snap_id && parseInt(snap_id)){
          snap_details['id'] = parseInt(snap_id);
        }
        this.restApiService.postAPI('snap/add',snap_details,(response)=>{
          if(response && response.id){
            return callback && callback(response);
          }else{
            return callback && callback(0);
          }
        });
      }else{
        return callback && callback(0);
      }
    });
  }

}
