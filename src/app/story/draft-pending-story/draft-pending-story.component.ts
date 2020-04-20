import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../_services';
import { AWS_DEFAULT_LINK } from '../../config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HelperService } from 'src/app/_helpers';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';
declare let $: any;

@Component({
  selector: 'app-draft-pending-story',
  templateUrl: './draft-pending-story.component.html',
  styleUrls: ['./draft-pending-story.component.scss'],
  providers: [DatePipe],
})

export class DraftPendingStoryComponent implements OnInit {
  private unsubscribe$ = new Subject();
  mutiple_stories_array=new Array();
  user_id:number;
  @ViewChild('story_content') story_content:ElementRef; 
  school_id_array= new Array();

  school_id:number;
  story_school_array = new Array();
  story_id:number;
  story_type_admin_parent_status = false;
  story_type_array = new Array();
  story_date_status = false;
  story_expiry_date_status = false;
  disable_select_school = true;

  story_school_error_status = false;
  story_type_error_status = false;
  story_created_date_error_status = false;
  story_expiry_date_error_status = false;
  story_created_by_role:string;
  story_creation_popup_error= false;

   /* user story Created date */
   user_story_created_date:any=new Date();

   /* user story expiry date */
   user_story_expiry_date:any=new Date();
 
   public datepickerConfig: Partial< BsDatepickerConfig > = new BsDatepickerConfig();

  default_story_popup_details = new Array();

  currentPage: number = 0;
  pageSize: number = 6;
  hasMoreStories: boolean = true;
  draft_pending:string;

  constructor(
    private elementRef : ElementRef,
    private sanitizer: DomSanitizer,  
    private router: Router, 
    public route:ActivatedRoute,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private helperService: HelperService,
    private awsImageuploadService: AwsImageUploadService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.user_id=this.dataService.hasUserId();
    // this.story_type_array.push({type:'STORY', display:'STORY', isChecked:false});
    this.story_type_array.push({type:'COMMUNITY_POST', display:'BLOG POST', isChecked:false});
    // this.story_type_array.push({type:'LEARNING_NOTE', display:'CHILD NOTE', isChecked:false});
    this.story_type_array.push({type:'ADVERTISEMENT', display:'SCHEDULE AN EVENT', isChecked:false});

    this.activatedRoute.params.subscribe(paramsId => {
      this.currentPage = 0;
      this.mutiple_stories_array=[];
      this.draft_pending = paramsId.type;
      this.hasMoreStories = true;
      if(this.draft_pending == 'draft' || this.draft_pending == 'pending' || this.draft_pending == 'approved'){
        this.showStories();
      }
  });
  
  }

  /*
  * Default Angular Life cycle method
  */
  ngOnInit() {
  this.datepickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'DD/MM/YYYY',
     });
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          if(response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length>0){
            response['schoolDetail'].forEach(element => {
              if(element.school.id && element.school.name && element.role){
                if(element.role && Array.isArray(element.role) && element.role.length>0){
                  var find_school_id = this.school_id_array.findIndex(obj => obj == element.school.id);
                  if(find_school_id == -1){
                    var index_value= element.role.findIndex(obj => obj == 'ADMIN' || obj == 'TEACHER' || obj == 'PARENT');
                    if(index_value>-1){
                      this.school_id_array.push(element.school.id);
                    }
                  }
                }
              }
            });
            obj.showStories();
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
  * Function to display stories
  */
  showStories(){
    // this.mutiple_stories_array=[];
    this.alertService.showLoader();
    if(this.user_id && this.school_id_array && this.school_id_array.length>0){
      // this.school_id_array.forEach(element => {
      //   if(element){
          this.restApiService.getData(`story/query?userId=${this.user_id}&status=${this.draft_pending=='draft' ? 'DRAFTED': (this.draft_pending == 'pending'? 'SUBMITTED': 'PUBLISHED')}&sort=updatedAt,desc&page=${this.currentPage}&size=6`,(response)=>{
            if (response.empty) this.hasMoreStories = false;
            if(response && response.content && Array.isArray(response.content) && response.content.length>0){
              if(response.content.length < this.pageSize) {console.log('the content length is ' + response.content.length); this.hasMoreStories = false;}
                // response=response.content.sort(function(x, y){
                //   return y.updatedAt - x.updatedAt;
                // });
                // response=response.filter((details)=>{ return details.status === "DRAFTED" || details.status === "SUBMITTED"});
                response.content.forEach(story => {
                  this.restApiService.getData(`story/${story.id}/priviliges/user/${this.user_id}`, (access_response)=>{
                    
                    if(access_response && access_response.id && access_response.edit1){
                      story['delete_permission']=true;
                    }
                  });
                  this.restApiService.getData('user/'+story.userId,(user_detail_response)=>{
                    if(user_detail_response && user_detail_response.id && user_detail_response.userProfile){
                      try{
                        if(user_detail_response.userProfile['defaultSnapId']){
                          this.restApiService.getData('snap/'+user_detail_response.userProfile['defaultSnapId'],(snap_details_response)=>{
                            if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                              story['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                            }
                          });
                        }else{
                          story['staticDpImg']=false;
                        }
                        story['createrFirstName']=user_detail_response.userProfile.firstName;
                        story['createrLastName']=user_detail_response.userProfile.lastName;
                      }catch(e){}
                    }
                  });
                  if(story.caption!='' && story.caption){
                    story.caption = this.helperService.getEventTitle(story.caption);
                    var more_text='';
                    if(story.caption.length>32){
                      more_text=". .";
                    }
                    story.caption= story.caption.substring(0,32)+more_text;
                    story.caption=this.sanitizer.bypassSecurityTrustHtml(story.caption);
                  }
                  story['multiple_file_array']=[];
                  var image_array=[],video_array=[],pdf_array=[];
                  this.story_content.nativeElement.innerHTML=this.sanitizer.bypassSecurityTrustHtml(story.text);
                  var container= this.story_content.nativeElement.querySelectorAll('div');
                  var container_main_array = Array.prototype.slice.call(container);
                  container_main_array.forEach(main_element=>{
                    var container_child_array = Array.prototype.slice.call(main_element.children);
                    container_child_array.every(child_element=>{
                      if(child_element.tagName=="P"){
                        if(main_element.innerHTML){
                          var more_text='';
                          if(main_element.innerHTML>100){
                            more_text=". .";
                          }
                          main_element.innerHTML= main_element.innerHTML.substring(0,100)+more_text;
                        }
                        story['multiple_file_array'].push({type:'text_file',text_data:this.sanitizer.bypassSecurityTrustHtml(main_element.innerHTML),text_content:main_element.innerHTML});  
                      }else if(child_element.tagName=="IMG"){
                        if(child_element.dataset.src){
                          story['multiple_file_array'].push({type:'image_file',image_src:AWS_DEFAULT_LINK+child_element.dataset.src});
                        }
                      }else if(child_element.tagName=="VIDEO"){
                        if(child_element.dataset.src){
                          story['multiple_file_array'].push({type:'video_file',video_src:AWS_DEFAULT_LINK+child_element.dataset.src});
                        }
                      }else if(child_element.tagName=="EMBED"){
                        if(child_element.dataset.src){
                          story['multiple_file_array'].push({type:'pdf_file',pdf_src:this.sanitizer.bypassSecurityTrustResourceUrl(AWS_DEFAULT_LINK+child_element.dataset.src+'#view=FitH')});
                        }
                      }
                    });
                  });
                  var image_array=[], video_array=[], pdf_array=[], text_array=[];
                  if(story.multiple_file_array && Array.isArray(story.multiple_file_array) && story.multiple_file_array.length>0){
                    story.multiple_file_array.forEach(element => {
                      if(element.type == 'image_file'){
                        image_array.push(element);
                      }else if(element.type == 'video_file'){
                        video_array.push(element);
                      }else if(element.type == 'pdf_file'){
                        pdf_array.push(element);
                      }else if(element.type == 'text_file'){
                        text_array.push(element);
                      }
                    });
                    story['image_array']=image_array;
                    story['video_array']=video_array;
                    story['pdf_array']=pdf_array;
                    story['text_array']=text_array;
                  }
                  var check_array=this.mutiple_stories_array.filter((stories)=> { return stories.id == story.id});
                  if(check_array.length==0)
                    this.mutiple_stories_array.push(story);
                    // console.log(this.mutiple_stories_array);
                });
              }
              this.alertService.hideLoader();
          });
      //   }
      // });
    }
  }

  loadMoreStories() {
    this.currentPage = this.currentPage + 1;
    this.showStories();
  }

  /* Date Pipe to change to specific format */
  transformDateViewFormat(date){
    date = new Date(date);
    return this.datePipe.transform(date, "dd/MM/yyyy"); //whatever format you need. 
  }

  /* Date Pipe to change format */
  transformDateChange(date) {
    return this.datePipe.transform(date, "dd/MM/yyyy"); //whatever format you need. 
  }
  
  /* Date Picker Event */
  onChangeDatePickerStart(event: any, type) {
    if(event && type){
      if(type=='created'){
        this.user_story_created_date=event;
      }else if(type=='expiry'){
        this.user_story_expiry_date=event;
      }
    }
  }

  /*
  * Show Edit story confirmation popup
  */
 showEditStoryPopup(story_id, school_id,story_type, user_story_created_date,user_story_expiry_date){
    this.default_story_popup_details.length = 0;
    this.default_story_popup_details.push({story_id:story_id, school_id:school_id,story_type:story_type, user_story_created_date:user_story_created_date,user_story_expiry_date:user_story_expiry_date})
    $('#alert_edit_story_popup').modal('show');
  }

  /*
  * route to story edit page
  */
  editStory(){
    if(this.default_story_popup_details && Array.isArray(this.default_story_popup_details) && this.default_story_popup_details.length == 1){
      this.default_story_popup_details.forEach(story_element => {
        if(story_element.story_id && story_element.school_id && story_element.story_type && story_element.user_story_created_date){
          this.story_id = story_element.story_id;
          $('#alert_edit_story_popup').modal('hide');
          this.createStoryPopup();
          this.storySelectSchool(parseInt(story_element.school_id));
          if(this.dataService.hasRole()!=='PARENT'){
            this.storySelectStoryType(story_element.story_type);
            if(story_element.story_type=='ADVERTISEMENT' && story_element.user_story_expiry_date){
              this.user_story_expiry_date = story_element.user_story_expiry_date;
              // this.user_story_expiry_date = this.transformDateViewFormat(story_element.user_story_expiry_date);
            }
          }
          if(story_element.user_story_created_date){
            this.user_story_created_date = story_element.user_story_created_date;
            // this.user_story_created_date = this.transformDateViewFormat(story_element.user_story_created_date);
          }
          this.disable_select_school = true;
        }
      });
    }
  }


  /*
  * create story function to parent, teacher and admin
  */
  createStoryPopup(){
    localStorage.removeItem('story_creation_type_details');
    this.story_school_array.length=0;
    this.story_type_admin_parent_status= false;
    this.story_date_status = false;
    this.story_expiry_date_status = false;

    this.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response && response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length>0){
        response['schoolDetail'].forEach(element => {
          if(element.school.id && element.school.name && element.role){
            var check_id=this.story_school_array.filter((details)=>{ return details.id === element.school.id});
            if(check_id.length==0){
              let staticSchoolDpImg='';
              if(element['defaultSnapId']){
                this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                  if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                    staticSchoolDpImg=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  }
                });
              }
              this.story_school_array.push({id: element.school.id,name: element.school.name, role: element.role, staticSchoolDpImg:staticSchoolDpImg, isChecked: false})
            }
          }
        });
        $('#create_story_draft_popup').modal('show');
      }
    });
  }

  /*
  * Function to select the school
  * while creating the story
  */
  private storySelectSchool(school_id){
    this.story_type_admin_parent_status = false;
    this.story_date_status = false;
    this.story_expiry_date_status = false;
    
    this.story_school_array.forEach(element => {
      if(element.id!==school_id){
        element.isChecked = false;
      }
    });
    var check_id=this.story_school_array.filter((details)=>{ return details.id === parseInt(school_id) && details.isChecked === true});
    if(check_id.length==0){
      var index_value= this.story_school_array.findIndex(obj => obj.id==parseInt(school_id));
      if(index_value>-1){
        if(typeof this.story_school_array[index_value] !== 'undefined') {
          this.story_school_array[index_value]['isChecked']=true;
        }
      }
    }else{
      var index_value= this.story_school_array.findIndex(obj => obj.id==parseInt(school_id));
      if(index_value>-1){
        if(typeof this.story_school_array[index_value] !== 'undefined') {
          this.story_school_array[index_value]['isChecked']=false;
        }
      }
    }
    this.story_type_array.forEach(element => {
      element.isChecked = false;
    });

    var check_id_selected=this.story_school_array.filter((details)=>{ return details.id === parseInt(school_id) && details.isChecked === true});
    if(check_id_selected.length>0){
      if(check_id_selected && Array.isArray(check_id_selected)){
        check_id_selected.forEach(element => {
          if(element.role && Array.isArray(element.role) && element.role.length>0){
            var index_value= element.role.findIndex(obj => obj == 'ADMIN' || obj == 'TEACHER');
            if(index_value>-1){
              this.story_type_admin_parent_status= true;
            }
            if(!this.story_type_admin_parent_status){
              var parent_check_index_value= element.role.findIndex(obj => obj == 'PARENT');
              if(parent_check_index_value>-1){
                this.story_created_by_role = 'PARENT';
                this.story_date_status = true;
                this.story_type_array.forEach(element=>{
                  if(element.type=='STORY'){
                    element.isChecked = true;
                  }
                })
              }
            }
            var admin_check_index_value= element.role.findIndex(obj => obj == 'ADMIN');
            if(admin_check_index_value>-1){
              this.story_created_by_role='ADMIN';
            }

            if(this.story_created_by_role!='ADMIN' &&  this.story_created_by_role!='PARENT'){
              var teacher_check_index_value= element.role.findIndex(obj => obj == 'TEACHER');
              if(teacher_check_index_value>-1){
                this.story_created_by_role='TEACHER';
              }
            }

          }
        });
      }
    }
  }

  /*
  * Function to select the story type
  * while creating the story
  */
  storySelectStoryType(type){
    this.story_date_status = false;
    this.story_expiry_date_status = false;

    this.story_type_array.forEach(element => {
      if(element.type!==type){
        element.isChecked = false;
      }
    });
    var check_id=this.story_type_array.filter((details)=>{ return details.type === type && details.isChecked === true});
    if(check_id.length==0){
      var index_value= this.story_type_array.findIndex(obj => obj.type == type);
      if(index_value>-1){
        if(typeof this.story_type_array[index_value] !== 'undefined') {
          this.story_type_array[index_value]['isChecked']=true;
        }
      }
    }else{
      var index_value= this.story_type_array.findIndex(obj => obj.type == type);
      if(index_value>-1){
        if(typeof this.story_type_array[index_value] !== 'undefined') {
          this.story_type_array[index_value]['isChecked']=false;
        }
      }
    }
    var check_id_selected=this.story_type_array.filter((details)=>{ return details.type == type && details.isChecked == true});
    if(check_id_selected.length>0){
      if(check_id_selected && Array.isArray(check_id_selected)){
        this.story_date_status=true;
        this.user_story_created_date=new Date();
      }
    }
    
    if(type=='ADVERTISEMENT'){
      this.story_expiry_date_status = true ;
      this.user_story_expiry_date=new Date();
    }
  }

  /*
  * Function to save all story details
  */
  saveStoryPopupDetails(){
    this.story_creation_popup_error= false;
    this.story_school_error_status = false;
    this.story_type_error_status = false;
    this.story_created_date_error_status = false;
    this.story_expiry_date_error_status = false;
    var school_id=0,story_type='';

    if(this.story_school_array && Array.isArray(this.story_school_array) && this.story_school_array.length>0){
      this.story_school_array.forEach(element => {
        if(element.isChecked){
          school_id= element.id;
        }
      });
    }
    if(!school_id){
      this.story_school_error_status = true;
      return false;
    }

    if(this.story_type_array && Array.isArray(this.story_type_array) && this.story_type_array.length>0){
      this.story_type_array.forEach(element => {
        if(element.isChecked){
          story_type= element.type;
        }
      });
    }
    if(!story_type){
      this.story_type_error_status = true;
      return false;
    }
    if(!this.user_story_created_date){
      this.story_created_date_error_status = true;
      return false;
    }
    if(story_type && story_type=='ADVERTISEMENT' && !this.user_story_expiry_date){
      this.story_expiry_date_error_status = true;
      return false;
    }

    if(school_id && story_type && this.user_story_created_date && this.story_created_by_role && this.story_id){
      if(story_type=='ADVERTISEMENT' && !this.user_story_expiry_date){
        this.story_creation_popup_error= true;
        return false;
      }
      var story_creation_type_details = {'school_id':school_id,'story_type':story_type,'story_created_date':this.user_story_created_date, 'story_created_by_role': this.story_created_by_role, 'story_expiry_date':this.user_story_expiry_date};
      localStorage.setItem('story_creation_type_details', JSON.stringify(story_creation_type_details));
      localStorage.setItem('story_details',JSON.stringify({'story_id':this.story_id}));
      $('#create_story_draft_popup').modal('hide');
      return this.router.navigateByUrl('/story/create/new');
    }else{
      this.story_creation_popup_error= true;
      return false;
    }
  }

  /*
  * Function to delete story
  */
  deleteStoryPopup(story_id,story_text){
    this.default_story_popup_details.length = 0;
    if(story_id){
      this.default_story_popup_details.push({story_id:story_id,story_text:story_text})
      $('#alert_delete_story_popup').modal('show');
    }
  }

  deleteStory(){
    if(this.default_story_popup_details && Array.isArray(this.default_story_popup_details) && this.default_story_popup_details.length == 1){
      this.default_story_popup_details.forEach(story_element => {
        if(story_element.story_id && story_element.story_text){
          this.restApiService.deleteAPI('story/'+parseInt(story_element.story_id),(story_delete_response)=>{
            $('#alert_delete_story_popup').modal('hide');
            var check_index = this.mutiple_stories_array.findIndex((obj)=>{ return obj.id == story_element.story_id});
            if(check_index>-1){
              this.mutiple_stories_array.splice(check_index,1);
              this.alertService.showAlertBottomNotification('Story deleted');
              this.getImagesRelativePath(story_element.story_text,(relative_path_response)=>{
                if(relative_path_response && Array.isArray(relative_path_response) && relative_path_response.length > 0){
                  relative_path_response.forEach(element => {
                    if(element.relative_path){
                      this.awsImageuploadService.deleteFile(element.relative_path,()=>{});
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  getImagesRelativePath(story_text,callback){
    let image_relative_path=[];
    this.story_content.nativeElement.innerHTML=this.sanitizer.bypassSecurityTrustHtml(story_text);
    var container= this.story_content.nativeElement.querySelectorAll('div');
    var container_main_array = Array.prototype.slice.call(container);
    container_main_array.forEach(main_element=>{
      var container_child_array = Array.prototype.slice.call(main_element.children);
      container_child_array.every(child_element=>{
        if(child_element.tagName=="IMG"){
          if(child_element.dataset.src){
            image_relative_path.push({relative_path:child_element.dataset.src});
          }
        }else if(child_element.tagName=="VIDEO"){
          if(child_element.dataset.src){
            image_relative_path.push({relative_path:child_element.dataset.src});
          }
        }else if(child_element.tagName=="EMBED"){
          if(child_element.dataset.src){
            image_relative_path.push({relative_path:child_element.dataset.src});
          }
        }
      });
    });
    return callback && callback(image_relative_path);
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
  updateDefaultImageUrl(event){
    this.helperService.updateDefaultImageUrlHelper(event);
  }
}