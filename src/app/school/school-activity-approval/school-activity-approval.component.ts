import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../_services';
import { AWS_DEFAULT_LINK } from '../../config';
import { saveAs } from 'file-saver';
import { HelperService } from '../../_helpers';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-school-activity-approval',
  templateUrl: './school-activity-approval.component.html',
  styleUrls: ['./school-activity-approval.component.scss']
})
export class SchoolActivityApprovalComponent implements OnInit {
  private unsubscribe$ = new Subject();
  mutiple_stories_array=new Array();
  story_type_display:string='ALL';
  user_id:number;
  @ViewChild('story_content') story_content:ElementRef; 

  school_list_array=new Array();
  selected_school_id:number;
  multiple_file_array = new Array();
  sort_story_school_array= new Array();
  selected_school_name:string='';
  refresh_token:number;
  constructor(
    private elementRef : ElementRef,
    private sanitizer: DomSanitizer,  
    private router: Router, 
    public route:ActivatedRoute,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private helperService: HelperService,
    private location:Location,
    private alertService: AlertService,
  ) { 
    this.dataService.getSchoolId.takeUntil(this.unsubscribe$).subscribe((id)=>{this.selected_school_id=id;});
    this.user_id=this.dataService.hasUserId();
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if(!this.refresh_token && params['refresh']){
        this.refresh_token=params['refresh'];
      }
      if(params['refresh'] && this.refresh_token && params['refresh']>this.refresh_token){
        this.refresh_token=params['refresh'];
        this.ngOnInit();
        this.ngAfterViewInit();
      }
      this.location.replaceState(this.location.path().split('?')[0], '');
    });
  }

  /*
  * Default Angular Life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Activity Approval' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
          if(response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length>0){
              response['schoolDetail'].forEach(element => {
                if(element.school.id && element.school.name && element.role){
                  var check_id=obj.sort_story_school_array.filter((details)=>{ return details.id === element.school.id});
                  if(check_id.length==0){
                    var school_name='';
                    if(element.school.name){
                      school_name = element.school.name.replace(/\s+/g,"_");
                    }
                    school_name = school_name+"_"+element.school.id;
                    obj.sort_story_school_array.push({
                      id: element.school.id,
                      name: element.school.name,
                      display_id: school_name,
                      isChecked:false,
                      story_type:[{type:'ALL', display:'All', isChecked: false},
                                  {type:'STORY', display:'Story', isChecked:false},
                                  {type:'COMMUNITY_POST', display:'Community Post', isChecked:false},
                                  {type:'LEARNING_NOTE', display:'Child Note', isChecked:false},
                                  {type:'ADVERTISEMENT', display:'Sponsorship', isChecked:false},
                                  ]
                                });
                  }
                }
              });
            obj.showStories();
            if(this.selected_school_id){
              this.sort_story_school_array.forEach(element => {
                if(element.id==this.selected_school_id){
                  if(document.getElementById(element.display_id) && document.getElementById(element.display_id).style){
                    document.getElementById(element.display_id).style.display = 'block';
                  }
                }
              });
            }
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
    this.mutiple_stories_array=[];
    if(this.user_id && this.selected_school_id && this.story_type_display){
      this.restApiService.getData(`story/school/${this.selected_school_id}/user/${this.user_id}`,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response=response.sort(function(x, y){
            return y.updatedAt - x.updatedAt;
          });
          response=response.filter((details)=>{ return details.status === "SUBMITTED"});
          if(response && Array.isArray(response) && response.length>0){
            if(this.story_type_display!='ALL'){
              response=response.filter((details)=>{ return details.type === this.story_type_display});
            }
            response.forEach(story => {
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
                // var more_text='';
                // if(story.caption.length>200){
                //   more_text=". .";
                // }
                // story.caption= story.caption.substring(0,200)+more_text;
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
                      if(main_element.innerHTML>200){
                        more_text=". .";
                      }
                      main_element.innerHTML= main_element.innerHTML.substring(0,200)+more_text;
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

            });
          }else{
            this.alertService.showAlertBottomNotification('No approval stories')
            return this.router.navigate(['/activity']);
          }
        }
      });
    }
  }
  
  /* 
  * Function to download PDF File 
  */
  downloadFile(link){
    this.restApiService.downloadFile(link,(response)=>{
      saveAs(response);
    });
  }

  /* 
  * Function to open Sort dropdown bar
  */
  openSortTypeDropdown(){
   if(document.getElementById('stories_sort_type') && document.getElementById('stories_sort_type').style.display=='block'){
    document.getElementById('stories_sort_type').style.display = 'none';
   }else if(document.getElementById('stories_sort_type') && document.getElementById('stories_sort_type').style.display=='none'){
    document.getElementById('stories_sort_type').style.display = 'block';
   }
  }

  /* 
  * Function to select school and 
  * show type of story to select
  */
  selectSortTypeSchool(school_id, display_id){
    this.selected_school_id=school_id;
    if(this.sort_story_school_array && this.sort_story_school_array.length>0){
      this.sort_story_school_array.forEach(element => {
        if(document.getElementById(element.display_id) && document.getElementById(element.display_id).style){
          document.getElementById(element.display_id).style.display = 'none';
        }
      });
    }
    if(document.getElementById(display_id) && document.getElementById(display_id).style){
      document.getElementById(display_id).style.display = 'block';
    }
  }

  /* 
  * Function to select school story type 
  */
  selectStoryType(school_id, story_sort_type, school_name){
    this.selected_school_id = school_id;
    this.story_type_display= story_sort_type;
    this.selected_school_name = school_name;
    if(this.selected_school_id && this.story_type_display){
      if(document.getElementById('stories_sort_type')){
        document.getElementById('stories_sort_type').style.display = 'none';
      }
      this.sort_story_school_array.forEach(element => {
        if(element.id!=this.selected_school_id){
          if(document.getElementById(element.display_id)){
            document.getElementById(element.display_id).style.display = 'none';
          }
        }
      });
      this.showStories();
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
