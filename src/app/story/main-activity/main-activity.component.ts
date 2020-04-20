import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, HostListener, Directive } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { DomSanitizer } from '@angular/platform-browser';
import { AWS_DEFAULT_LINK } from '../../config';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../_services';
import { Subject } from 'rxjs';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji/public_api';
import { EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji'
import { GalleryService, Image } from '@ks89/angular-modal-gallery';
import { Location } from '@angular/common';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';
import { HelperService } from 'src/app/_helpers';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
declare let $: any;

@Component({
  selector: 'app-main-activity',
  templateUrl: './main-activity.component.html',
  styleUrls: ['./main-activity.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MainActivityComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @ViewChild('story_header_content') story_header_content: ElementRef;
  mutiple_stories_array = new Array();
  comment_multiple_file_array = new Array();
  story_type_display: string = 'ALL';
  user_id: number;
  user_child_detail_array = new Array();
  @ViewChild('story_content') story_content: ElementRef;
  @ViewChild('story_description_content') story_description_content: ElementRef;
  @ViewChild('story_comment_content') story_comment_content: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;
  school_details;
  //Conversation required Elements
  conversation_multiple_file_array = new Array();
  conversation_emojiStatus: boolean = false;
  conversation_post_button: boolean = true;
  conversation_selected_school_id: number;
  conversation_school_list_array = new Array();
  conversation_story_created_by_role: string;
  conversation_school_teacher_array = new Array();
  conversation_school_admin_array = new Array();
  conversation_school_parent_array = new Array();
  conversation_users_array = [];
  tagged_conversation_users = [];
  conversation_disabled_status: boolean = false;
  isOnlyAttendee: boolean = false;
  currentVisitedIndex: number = 0;
  loadingStories: boolean = false;
  maxElements: number;
  userEmail:string;
  userProfilename:string;
  click_element_type: string;
  conversation_click_element_type_array = new Array();
  normalUser :boolean = true;

  marked = false;
  theCheckbox = false;

  @HostListener('window:scroll', ['$event'])
  onScroll(e) {
    $(window).on("scroll", function () {
      var scrollHeight = $(document).height();
      var scrollPosition = $(window).height() + $(window).scrollTop();
      if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
      }
    });
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      if((this.mutiple_stories_array.length < this.maxElements) && !this.loadingStories){
        // this.story_offset = this.story_offset + this.story_limit;
        this.showStories();
      }
    }
  }

  school_list_array = new Array();
  selected_school_id: number;
  multiple_file_array = new Array();
  sort_story_school_array = new Array();
  selected_school_name: string = '';
  delete_comment_id_details = new Array();

  refresh_token: number;

  story_limit: number = 1;
  story_offset: number = 0;
  currentUser: any;
  constructor(
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private router: Router,
    public route: ActivatedRoute,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
    private galleryService: GalleryService,
    public emoji: EmojiService,
    private location: Location,
    private awsImageuploadService: AwsImageUploadService,
    private helperService: HelperService,
    private storageService: LocalStorageService
  ) {
    this.dataService.getSchoolId.takeUntil(this.unsubscribe$).subscribe((id) => {
      this.selected_school_id = id;
      this.conversation_selected_school_id = id;
      this.conversation_disabled_status = true;
    });
    this.user_id = this.dataService.hasUserId();
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if (!this.refresh_token && params['refresh']) {
        this.refresh_token = params['refresh'];
      }
      if (params['refresh'] && this.refresh_token && params['refresh'] > this.refresh_token) {
        this.refresh_token = params['refresh'];
        this.ngOnInit();
      }
      this.location.replaceState(this.location.path().split('?')[0], '');
    });
  }


  /*
  * Default Angular Life cycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Dashboard' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response:any) => {
      if (response) {
        if (response['user'] && response['user']['id']) {
          obj.userEmail = response['user']['email'];
          var EmailName = obj.userEmail.substring(0, obj.userEmail.lastIndexOf("@"));
          this.currentUser = response;
          this.authenticateService.getSelectedSchoolDetails((school_details_response) => {
            this.school_details = school_details_response;
          });
          if (response.user.userProfile.firstName) {
            this.userProfilename = response.user.userProfile.firstName;
          } else this.userProfilename = EmailName;

          this.mutiple_stories_array.length = 0;
          obj.story_limit = 1;
          obj.story_offset = 0;
          obj.showStories();
          if (response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
            response['schoolDetail'].forEach(element => {
              if (element.school.id && element.school.name && element.role) {
                var check_id = obj.sort_story_school_array.filter((details) => { return details.id === element.school.id });
                if (check_id.length == 0) {
                  var school_name = '';
                  if (element.school.name) {
                    school_name = element.school.name.replace(/\s+/g, "_");
                  }
                  school_name = school_name + "_" + element.school.id;
                  obj.sort_story_school_array.push({
                    id: element.school.id,
                    name: element.school.name,
                    display_id: school_name,
                    isChecked: false,
                    story_type: [{ type: 'ALL', display: 'All', isChecked: false },
                    { type: 'STORY', display: 'Story', isChecked: false },
                    { type: 'COMMUNITY_POST', display: 'Public Event', isChecked: false },
                    { type: 'LEARNING_NOTE', display: 'Child Note', isChecked: false },
                    { type: 'ADVERTISEMENT', display: 'Sponsorship', isChecked: false },
                    ]
                  });
                }
              }
            });
            obj.getUserChildDetails();
            if (this.selected_school_id) {
              obj.assignedConversationSchoolDetails();
              this.sort_story_school_array.forEach(element => {
                if (element.id == this.selected_school_id) {
                  if (document.getElementById(element.display_id) && document.getElementById(element.display_id).style) {
                    document.getElementById(element.display_id).style.display = 'block';
                  }
                }
              });
            }
          }
        } else {
          return obj.router.navigateByUrl('/login');
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
  * Function to display stories
  */
  async showStories() {
    // this.mutiple_stories_array=[];
    // && this.selected_school_id && this.story_type_display
    var storiesArray: any = [];
    // this.alertService.showLoader();
    this.loadingStories = true;
    if (this.user_id) {
      storiesArray = await this.getStories();
      storiesArray.forEach(story => {
        var textDescContent: any;
        var check_already_present_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story.id });
        if (check_already_present_array.length == 0) {
          this.restApiService.getData('user/' + story.userId, (user_response) => {
            if (user_response && user_response.id && user_response.userProfile) {
              try {
                if (user_response.userProfile['defaultSnapId']) {
                  this.restApiService.getData('snap/' + user_response.userProfile['defaultSnapId'], (snap_details_response) => {
                    if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                      story['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                    }
                  });
                } else {
                  story['staticDpImg'] = false;
                }
                story['createrFirstName'] = user_response.userProfile.firstName;
                story['createrLastName'] = user_response.userProfile.lastName;
              } catch (e) { }
            }
          });
          // story['display_type'] = '';
          // story['icon_type'] = '';
          // if (story.type == 'ADVERTISEMENT') {
          //   story['display_type'] = 'SPONSORSHIP';
          //   story['icon_type'] = '<i class="fa fa-buysellads"></i>';
          // } else if (story.type == 'LEARNING_NOTE') {
          //   story['display_type'] = 'CHILD NOTE';
          //   story['icon_type'] = '<i class="fa fa-child"></i>';
          // } else if (story.type == 'COMMUNITY_POST') {
          //   story['display_type'] = 'PUBLIC EVENT';
          //   story['icon_type'] = '<i class="fa fa-users"></i>';
          // } else if (story.type == 'STORY') {
          //   story['display_type'] = 'STORY';
          //   story['icon_type'] = '<i class="fa fa-bookmark"></i>';
          // }

          // if(story.caption!='' && story.caption){
          //   var more_text='';
          //   if(story.caption.length>500){
          //     more_text=". .";
          //   }
          //   story.caption= story.caption.substring(0,500)+more_text;
          // }

          if (story.caption != '' && story.caption) {
            this.story_header_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.caption);
            var container = this.story_header_content.nativeElement.querySelectorAll('p');
            var container_main_array = Array.prototype.slice.call(container);
            container_main_array.forEach(main_element => {
              if (main_element.textContent) {
                story['caption_plain'] = main_element.textContent.substring(0,60) + (main_element.textContent.length>60 ? '...' : '');
              }
            });
            story.caption = this.sanitizer.bypassSecurityTrustHtml(story.caption);
          }
          // }
          story['multiple_file_array'] = [];
          var image_array = [], video_array = [], pdf_array = [];
          this.story_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.text);
          var container = this.story_content.nativeElement.querySelectorAll('div');
          var container_main_array = Array.prototype.slice.call(container);

          container_main_array.forEach((main_element, x) => {
            if (!textDescContent) {
              var descContent: any = "";
              if (main_element.getAttribute("name") == "text") {
                try {
                  textDescContent = JSON.parse(main_element.innerHTML);
                  if (textDescContent.content) this.story_description_content.nativeElement.innerHTML = unescape(textDescContent.content);
                  descContent = this.story_description_content.nativeElement.innerText;
                  if (descContent.length > 200) descContent = this.story_description_content.nativeElement.innerText.slice(0, 200) + '...';
                } catch (e) {}
                story['textContent'] = descContent;
              }
            }
            var container_child_array = Array.prototype.slice.call(main_element.children);
            container_child_array.every(child_element => {
              if (child_element.tagName == "P") {
                // if (main_element.innerHTML) {
                //   var more_text = '';
                //   if (main_element.innerHTML > 500) {
                //     more_text = "...";
                //   }
                //   main_element.innerHTML = main_element.innerHTML.substring(0, 500) + more_text;
                // }
                story['multiple_file_array'].push({ type: 'text_file', text_data: this.sanitizer.bypassSecurityTrustHtml(main_element.innerHTML), text_content: main_element.innerHTML });
              } else if (child_element.tagName == "IMG") {
                if (child_element.dataset.src) {
                  story['multiple_file_array'].push({ type: 'image_file', image_src: AWS_DEFAULT_LINK + child_element.dataset.src });
                }
              } else if (child_element.tagName == "VIDEO") {
                if (child_element.dataset.src) {
                  story['multiple_file_array'].push({ type: 'video_file', video_src: AWS_DEFAULT_LINK + child_element.dataset.src });
                }
              } else if (child_element.tagName == "EMBED") {
                if (child_element.dataset.src) {
                  story['multiple_file_array'].push({ type: 'pdf_file', pdf_src: this.sanitizer.bypassSecurityTrustResourceUrl(AWS_DEFAULT_LINK + child_element.dataset.src + '#view=FitH') });
                }
              }
            });
          });
          var image_array = [], video_array = [], pdf_array = [], text_array = [];
          if (story.multiple_file_array && Array.isArray(story.multiple_file_array) && story.multiple_file_array.length > 0) {
            story.multiple_file_array.forEach(element => {
              if (element.type == 'image_file') {
                image_array.push(element);
              } else if (element.type == 'video_file') {
                video_array.push(element);
              } else if (element.type == 'pdf_file') {
                pdf_array.push(element);
              } else if (element.type == 'text_file') {
                text_array.push(element);
              }
            });
            story['image_array'] = image_array;
            story['video_array'] = video_array;
            story['pdf_array'] = pdf_array;
            story['text_array'] = text_array;
          }
          story['emojiStatus'] = false;
          // Comment Part
          story['comment_array'] = [];
          story['disabledCommentPost'] = true;
          story['comment_display_count'] = 0;
          this.restApiService.getData('comment/getByEntity/1/entity/' + story.id, (comment_response) => {
            if (comment_response && Array.isArray(comment_response) && comment_response.length > 0) {
              comment_response = comment_response.sort(function (x, y) {
                if (x.value && x.value.updatedAt && y.value && y.value.updatedAt)
                  return x.value.updatedAt - y.value.updatedAt;

              });
              if(this.normalUser) comment_response = comment_response.filter((comment)=>{return comment.value.public});
              comment_response.forEach(comment_element => {
                if (comment_element.value && comment_element.value.comment && comment_element.value.user && comment_element.value.user.id && comment_element.value.user.userProfile) {
                  var comment_details = this.getCommentsDetails(comment_element.value.comment);
                  comment_element['value']['disabledChildCommentReply'] = true;
                  comment_element['value']['replyButtonStatus'] = true;
                  var commmentEmail = comment_element.value.user.email.substring(0, comment_element.value.user.email.lastIndexOf("@"));
                  if(comment_element.value.user.userProfile.firstName) {
                  if (comment_element.value.user.userProfile['defaultSnapId']) {
                    this.restApiService.getData('snap/' + comment_element.value.user.userProfile['defaultSnapId'], (snap_details_response) => {
                      if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                        comment_element['value']['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                      }
                    });
                  } else {
                    comment_element['value']['staticDpImg'] = '';
                  }
                } else comment_element.value.user.userProfile.firstName = commmentEmail;
                  comment_element['value']['delete_status'] = false;
                  if( (comment_element.value.user.id && this.user_id == parseInt(comment_element.value.user.id)) || this.authenticateService.isSuperAdmin()){
                    comment_element['value']['delete_status'] = true;
                  }
                  var child_comment_array = [], child_comment_display_count = 0;
                  if (comment_element.children && Array.isArray(comment_element.children) && comment_element.children.length > 0) {
                    comment_element.children = comment_element.children.sort(function (x, y) {
                      if (x.value && x.value.updatedAt && y.value && y.value.updatedAt)
                        return x.value.updatedAt - y.value.updatedAt;

                    });
                    comment_element.children.forEach(child_element => {
                      if (child_element.value && child_element.value.comment && child_element.value.user && child_element.value.user.id && child_element.value.user.userProfile) {
                        var child_comment_details = this.getCommentsDetails(child_element.value.comment);
                        if (child_element.value.user.userProfile['defaultSnapId']) {
                          this.restApiService.getData('snap/' + child_element.value.user.userProfile['defaultSnapId'], (snap_details_response) => {
                            if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                              child_element['value']['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                            }
                          });
                        } else {
                          child_element['value']['staticDpImg'] = '';
                        }
                        child_element['value']['delete_status'] = false;
                        if( (child_element.value.user.id && this.user_id == parseInt(child_element.value.user.id)) || this.authenticateService.isSuperAdmin() ){
                          child_element['value']['delete_status'] = true;
                        } 
                      }
                      var check_child_array = child_comment_array.filter((comments) => { return comments.id == child_element.value.id });
                      if (check_child_array.length == 0)
                        child_comment_array.push({ id: child_element.value.id, result: child_element.value, comment_details: child_comment_details });

                      child_comment_display_count = (child_comment_array ? (child_comment_array.length > 2 ? (child_comment_array.length - 2) : 0) : 0);
                    });
                  }
                  var check_array = story['comment_array'].filter((comments) => { return comments.id == comment_element.value.id });
                  if (check_array.length == 0)
                    story['comment_array'].push({ id: comment_element.value.id, result: comment_element.value, comment_details: comment_details, child_comment_array: child_comment_array, child_comment_display_count: child_comment_display_count });
                  // console.log(story['comment_array']);
                  }
              });
            }
            story['comment_display_count'] = (story['comment_array'] ? (story['comment_array'].length > 2 ? story['comment_array'].length - 2 : 0) : 0);
          });
          var check_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story.id });
          if (check_array.length == 0)
            this.mutiple_stories_array.push(story);
        }
      });
      this.alertService.hideLoader();
    }

  }

  /* 
  * Function to return comments details
  */
  getCommentsDetails(value) {
    var comment_details = [];
    this.story_comment_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(value);
    var container = this.story_comment_content.nativeElement.querySelectorAll('div');
    var container_main_array = Array.prototype.slice.call(container);
    container_main_array.forEach(main_element => {
      var container_child_array = Array.prototype.slice.call(main_element.children);
      container_child_array.every(child_element => {
        if (child_element.tagName == 'P') {
          comment_details.push({ type: 'text_file', text_data: this.sanitizer.bypassSecurityTrustHtml(main_element.innerHTML), text_content: main_element.innerHTML });
        } else if (child_element.tagName == "IMG") {
          if (child_element.dataset.src) {
            comment_details.push({ type: 'image_file', image_src: AWS_DEFAULT_LINK + child_element.dataset.src, relative_path: child_element.dataset.src });
          }
        } else if (child_element.tagName == "AUDIO") {
          if (child_element.dataset.src) {
            comment_details.push({ type: 'audio_file', audio_src: AWS_DEFAULT_LINK + child_element.dataset.src, relative_path: child_element.dataset.src });
          }
        }
      });
    });
    return comment_details;
  }

  /* 
   * To Get Child list 
   */
  getUserChildDetails() {
    this.user_child_detail_array = [];
    if (this.user_id) {
      this.restApiService.getData('user/' + this.user_id, (response) => {
        if (response && response.id && response.userProfile) {
          try {
            var user = [];
            user['id'] = response.id;
            if (response.userProfile['defaultSnapId']) {
              this.restApiService.getData('snap/' + response.userProfile['defaultSnapId'], (snap_details_response) => {
                if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                  user['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                }
              });
            } else {
              user['staticDpImg'] = false;
            }
            user['isChecked'] = true;
            user['user_type'] = 'parent';
            user['firstName'] = response.userProfile.firstName;
            user['lastName'] = response.userProfile.lastName;
            var check_id = this.user_child_detail_array.filter((details) => { return details.id === response.id && details.user_type == 'parent' });
            if (check_id.length == 0)
              this.user_child_detail_array.push(user);
          } catch (e) { }

          // this.restApiService.getData('user/childlist/'+this.user_id,(child_response)=>{
          //   if(child_response && Array.isArray(child_response) && child_response.length > 0){
          //     child_response.forEach(element => {
          //       if(element && element.id){
          //         var check_id=this.user_child_detail_array.filter((details)=>{ return details.id === element.id && details.user_type == 'child'});
          //         if(check_id.length==0){
          //           var child=[];
          //           child['id']=element.id;
          //           if(element['defaultSnapId']){
          //             child['staticDpImg']=API_URL_LINK+'snap/file/'+element['defaultSnapId'];
          //           }else{
          //             child['staticDpImg']='';
          //           }
          //           child['isChecked'] = false;
          //           child['user_type']= 'child';
          //           child['firstName']=element.firstName;
          //           child['lastName']=element.lastName;
          //           child['Dob']=element.Dob;
          //           this.user_child_detail_array.push(child);
          //         }
          //       }
          //     });
          //   }
          // });
        }
      });
    }
  }

  /* 
  * Function to download PDF File 
  */
  downloadFile(path) {
    if (path && path.changingThisBreaksApplicationSecurity) {
      this.restApiService.downloadAWSFile(path.changingThisBreaksApplicationSecurity, (response) => {
        saveAs(response);
      });
    }
  }

  /* 
  * Function to open Sort dropdown bar
  */
  openSortTypeDropdown() {
    if (document.getElementById('stories_sort_type')) {
      document.getElementById('stories_sort_type').style.display == 'none' ? document.getElementById('stories_sort_type').style.display = 'block' : document.getElementById('stories_sort_type').style.display = 'none'
    }
  }


  /* 
  * Function to select school and 
  * show type of story to select
  */
  selectSortTypeSchool(school_id, display_id) {
    this.selected_school_id = school_id;
    if (this.sort_story_school_array && this.sort_story_school_array.length > 0) {
      this.sort_story_school_array.forEach(element => {
        if (document.getElementById(element.display_id) && document.getElementById(element.display_id).style) {
          document.getElementById(element.display_id).style.display = 'none';
        }
      });
    }
    if (document.getElementById(display_id) && document.getElementById(display_id).style) {
      document.getElementById(display_id).style.display = 'block';
    }
  }

  /* 
  * Function to select school story type 
  */
  selectStoryType(school_id, story_sort_type, school_name) {
    this.selected_school_id = school_id;
    this.story_type_display = story_sort_type;
    this.selected_school_name = school_name;
    if (this.selected_school_id && this.story_type_display) {
      if (document.getElementById('stories_sort_type')) {
        document.getElementById('stories_sort_type').style.display = 'none';
      }
      this.sort_story_school_array.forEach(element => {
        if (element.id != this.selected_school_id) {
          if (document.getElementById(element.display_id)) {
            document.getElementById(element.display_id).style.display = 'none';
          }
        }
      });
      this.showStories();
    }
  }

  /*
  * Function to add focus
  */
  focusAdd(id) {
    $('#' + id).attr('style', 'height:90px;')
  }

  /*
  * Function to remove focus
  */
  focusRemove(id) {
    $('#' + id).attr('style', 'min-height: 0 !important')
  }

  /*
  * Function to show Post button
  */
  showPostButton(story_id, type, comment_id) {
    if (story_id && parseInt(story_id) && type) {
      this.enablePostButtonWithCondition(story_id, type, comment_id);
    }
  }

  /*
  * Function to upload image, video, pdf based on action type
  */
  uploadDocType(story_id, action_type, comment_type, comment_id) {
    $('#main_file').val('');
    if (action_type == 'image') {
      $('#main_file').attr('accept', '.jpg,.png,.jpeg');
      $('#main_file').off('change').on('change', e => {
        this.saveAllFiles(story_id, action_type, comment_type, comment_id);
      });
    } else if (action_type == 'audio') {
      $('#main_file').attr('accept', '.mp3,.WAV');
      $('#main_file').off('change').on('change', e => {
        this.saveAllFiles(story_id, action_type, comment_type, comment_id);
      });
    }
    $("#main_file").click();
  }

  /* 
  * Save image,audio 
  */
  saveAllFiles(story_id, type_sent, comment_type, comment_id) {
    if (type_sent == 'image' || type_sent == 'audio') {
      var check_details = this.checkFileExtenstion(type_sent);
      var file_data = $('#main_file').prop('files')[0];
      if (check_details) {
        this.saveToDb(file_data, type_sent, story_id, comment_type, comment_id);
        $('#main_file').val('');
        $('#panel_' + story_id).attr('style', 'display:none');
      }
    } else {
      this.alertService.showNotification('Something went wrong, please try again', 'error');
    }
  }

  /* 
  * Helper Function to check file extension
  */
  checkFileExtenstion(type_data) {
    if ($('#main_file').prop('files')[0] !== undefined && $('#main_file').prop('files')[0] !== '') {
      var file_data = $('#main_file').prop('files')[0];
      if (file_data != undefined && file_data != '') {
        var ext = file_data.name.toLowerCase().split(".");
        ext = ext[ext.length - 1].toLowerCase();
        var arrayExtensions, ext_type1, ext_type2, ext_type3;
        if (type_data == 'image') {
          arrayExtensions = ["jpg", "jpeg", "png"];
          ext_type1 = 'image/jpeg';
          ext_type2 = 'image/png';
          ext_type3 = 'image/jpg';
        } else if (type_data == 'audio') {
          arrayExtensions = ["mp3", "wav", "mpeg"];
          ext_type1 = 'audio/mp3';
          ext_type2 = 'audio/wav';
          ext_type3 = 'audio/mpeg';
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
          return true;
        }
        if (file_data.type == ext_type1 || file_data.type == ext_type2 || file_data.type == ext_type3) {
          if (file_data.size < 5120000) {
            return true;
          } else {
            this.alertService.showNotification('Size should be less than 5MB', 'error');
            $("#main_file").val('');
          }
        } else if (arrayExtensions && ext && arrayExtensions.lastIndexOf(ext) == -1) {
          this.alertService.showNotification('Wrong extension type, please try again', 'error');
          $("#main_file").val('');
        } else {
          this.alertService.showNotification('Wrong extension type, please try again', 'error');
          $("#main_file").val('');
        }
      }
    }
  }

  /* 
  * Helper Function to check file extension
  */
  checkConversationFileExtenstion(file: File, type_data) {
    if (file !== undefined && file && file instanceof File) {
      var file_data = file;
      var ext: any = file_data.name.toLowerCase().split(".");
      ext = ext[ext.length - 1].toLowerCase();
      var arrayExtensions, ext_type1, ext_type2, ext_type3;
      if (type_data == 'image') {
        arrayExtensions = ["jpg", "jpeg", "png"];
        ext_type1 = 'image/jpeg';
        ext_type2 = 'image/png';
        ext_type3 = 'image/jpg';
      } else if (type_data == 'audio') {
        arrayExtensions = ["mp3", "wav"];
        ext_type1 = 'audio/mp3';
        ext_type2 = 'audio/wav';
      } else {
        this.alertService.showNotification('Something went wrong, Please try again', 'error');
        return false;
      }
      if (file_data.type == ext_type1 || file_data.type == ext_type2 || file_data.type == ext_type3) {
        if (file_data.size < 5120000) {
          return true;
        } else {
          this.alertService.showNotification('Size should be less than 5MB', 'error');
          return false;
        }
      } else if (arrayExtensions.lastIndexOf(ext) == -1) {
        this.alertService.showNotification('Wrong extension type, please try again', 'error');
        return false;
      } else {
        this.alertService.showNotification('Wrong extension type, please try again', 'error');
        return false;
      }
    } else {
      return false;
    }
  }

  /* 
  * Function to save snap (image,audio)
  */
  saveToDb(file_data, type_sent, story_id, comment_type, comment_id) {
    if (this.user_id && story_id && this.selected_school_id) {
      var type_set_db;
      if (type_sent == 'image') {
        type_set_db = 1;
      } else if (type_sent == 'audio') {
        type_set_db = 2;
      }
      this.awsImageuploadService.uploadFileToAWS(file_data, 'story/' + this.selected_school_id + 'comments' + this.user_id, 0, (aws_image_upload_response) => {
        if (aws_image_upload_response && aws_image_upload_response.Location && aws_image_upload_response.key) {
          var check_id = this.multiple_file_array.filter((snap) => { return snap.relative_path === aws_image_upload_response.key });
          if (check_id.length == 0) {
            if (type_sent == 'image') {
              this.comment_multiple_file_array.push({ type: 'image_file', image_src: AWS_DEFAULT_LINK + aws_image_upload_response.key, story_id: story_id, file_name: file_data.name, comment_type: comment_type, comment_id: comment_id, relative_path: aws_image_upload_response.key });
            } else if (type_sent == 'audio') {
              this.comment_multiple_file_array.push({ type: 'audio_file', audio_src: AWS_DEFAULT_LINK + aws_image_upload_response.key, story_id: story_id, file_name: file_data.name, comment_type: comment_type, comment_id: comment_id, relative_path: aws_image_upload_response.key });
            }
            // Enabling Post or Reply button
            if (story_id && parseInt(story_id) && comment_type) {
              this.enablePostButtonWithCondition(story_id, comment_type, comment_id);
            }
          }
        }
      });
    } else {
      this.alertService.showNotification('Something went wrong, Please try again', 'error');
      return false;
    }
  }

  /* 
  * Function to enable post button with specific condition
  */
  private enablePostButtonWithCondition(story_id, comment_type, comment_id) {
    if (story_id && parseInt(story_id) && comment_type) {
      var check_id_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story_id });
      if (check_id_array && check_id_array.length > 0 && Array.isArray(check_id_array)) {
        check_id_array.forEach(story_element => {
          if (comment_type == 'parent' && document.getElementById('comment_text_' + story_id)) {
            let checked_array_multiple = this.comment_multiple_file_array.filter(obj => obj.story_id == parseInt(story_id) && obj.comment_type == 'parent');
            if (checked_array_multiple && Array.isArray(checked_array_multiple) && checked_array_multiple.length > 0) {
              story_element['disabledCommentPost'] = false;
            } else {
              story_element['disabledCommentPost'] = true;
              let post_comment = (<HTMLInputElement>document.getElementById('comment_text_' + story_id)).value;
              if (post_comment && post_comment.trim()) {
                story_element['disabledCommentPost'] = false;
              }
            }
          } else if (comment_type == 'child' && comment_id && document.getElementById('child_comment_text_' + comment_id)) {
            var check_child_array = story_element.comment_array.filter((comments) => { return comments.id == comment_id });
            if (check_child_array && check_child_array.length > 0 && Array.isArray(check_child_array)) {
              check_child_array.forEach(child_element => {
                if (child_element.result) {
                  let checked_array_multiple = this.comment_multiple_file_array.filter(obj => obj.story_id == parseInt(story_id) && obj.comment_type == 'child' && obj.comment_id == parseInt(comment_id));
                  if (checked_array_multiple && Array.isArray(checked_array_multiple) && checked_array_multiple.length > 0) {
                    child_element.result['disabledChildCommentReply'] = false;
                  } else {
                    child_element.result['disabledChildCommentReply'] = true;
                    let reply_comment = (<HTMLInputElement>document.getElementById('child_comment_text_' + comment_id)).value;
                    if (reply_comment && reply_comment.trim()) {
                      child_element.result['disabledChildCommentReply'] = false;
                    }
                  }
                }
              });
            }
          }
        });
      }
    }
  }

  /* 
  * Function to delete uploaded snap (image, audio)
  */
  delDocType(type, stories_id, comment_type, comment_id, relative_path) {
    if (relative_path && type) {
      var checked_index_value = this.comment_multiple_file_array.findIndex(obj => obj.relative_path == relative_path && obj.type == type && obj.story_id == parseInt(stories_id) && obj.comment_type == comment_type);
      if (checked_index_value > -1) {
        this.comment_multiple_file_array.splice(checked_index_value, 1);
        this.alertService.showAlertBottomNotification('Deleted');
        this.enablePostButtonWithCondition(stories_id, comment_type, comment_id);
        if (relative_path) {
          this.awsImageuploadService.deleteFile(relative_path, () => { });
        }
      } else {
        this.alertService.showNotification('Something went wrong, Please try again', 'error');
        return false;
      }
    } else {
      this.alertService.showNotification('Something went wrong, Please try again', 'error');
      return false;
    }
  }

  /*
  * Function to post parent comment
  */
  postComment(id,count) {
    document.getElementById('comment_text_' + id + '_error') ? document.getElementById('comment_text_' + id + '_error').innerHTML = '' : '';
    var template = '', post_comment = '';
    if (this.comment_multiple_file_array && this.comment_multiple_file_array.length > 0) {
      this.comment_multiple_file_array.forEach(element => {
        if (element.story_id == parseInt(id) && element.comment_type == 'parent') {
          if (element.type == 'image_file') {
            template += '<div name="image"><img data-src="' + element.relative_path + '"/></div>';
          } else if (element.type == 'audio_file') {
            template += '<div name="audio"><audio data-src="' + element.relative_path + '"></audio></div>';
          }
        }
      });
      if (parseInt(id) && document.getElementById('comment_text_' + id)) {
        post_comment = (<HTMLInputElement>document.getElementById('comment_text_' + id)).value;
        if (post_comment && post_comment.trim()) {
          template += '<div name="text"><p>' + post_comment.trim() + '</p></div>';
        }
      }
    } else {
      if (parseInt(id) && document.getElementById('comment_text_' + id)) {
        post_comment = (<HTMLInputElement>document.getElementById('comment_text_' + id)).value;
        if (post_comment && post_comment.trim()) {
          template = '<div name="text"><p>' + post_comment.trim() + '</p></div>';
        } else {
          document.getElementById('comment_text_' + id + '_error') ? document.getElementById('comment_text_' + id + '_error').innerHTML = 'Comment field is empty' : '';
          return false;
        }
      } else {
        document.getElementById('comment_text_' + id + '_error') ? document.getElementById('comment_text_' + id + '_error').innerHTML = 'Comment field is empty' : '';
        return false;
      }
    }
    if (this.user_id && parseInt(id) && template) {
      let comment_post_details = {
        "parentId": 0,
        "user": {
          "id": this.user_id,
        },
        "entityMap": {
          "entityContentId": 1,
          "concreteEntityId": parseInt(id)
        },
        "comment": template
      };
      this.restApiService.putAPI('comment/update', comment_post_details, (comment_response) => {
          if (comment_response && comment_response['id'] && comment_response.comment) {
            (<HTMLInputElement>document.getElementById('comment_text_' + id)).value = '';
            this.comment_multiple_file_array.length = 0;
            // this.alertService.showNotification('Done');
            var check_id = this.mutiple_stories_array.filter((stories) => { return stories.id == id });
            if (check_id.length > 0) {
              if (comment_response.comment && comment_response.user && comment_response.user.id && comment_response.user.userProfile) {
                var comment_details = this.getCommentsDetails(comment_response.comment);
                comment_response['disabledChildCommentReply'] = true;
                comment_response['replyButtonStatus'] = true;
                if (comment_response.user.userProfile['defaultSnapId']) {
                  this.restApiService.getData('snap/' + comment_response.user.userProfile['defaultSnapId'], (snap_details_response) => {
                    if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                      comment_response['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                    }
                  });
                } else {
                  comment_response['staticDpImg'] = '';
                }
                comment_response['delete_status'] = false;
                if (comment_response.user.id && this.user_id == parseInt(comment_response.user.id)) {
                  comment_response['delete_status'] = true;
                }
                check_id.forEach(element => {
                  element['disabledCommentPost'] = true;
                  element['emojiStatus'] = false;
                  if (element['comment_array']) {
                    var check_array = element['comment_array'].filter((comments) => { return comments.id == comment_response.id });
                    if (check_array.length == 0)
                      element['comment_array'].push({ id: comment_response.id, result: comment_response, comment_details: comment_details, child_comment_array: [], child_comment_display_count: 0 });
                  } else {
                    element['comment_array'] = [];
                    var check_array = element['comment_array'].filter((comments) => { return comments.id == comment_response.id });
                    if (check_array.length == 0)
                      element['comment_array'].push({ id: comment_response.id, result: comment_response, comment_details: comment_details, child_comment_array: [], child_comment_display_count: 0 });

                  }
                });
              }
            }
          } else if (!comment_response['success'] && comment_response['message']) {
            this.alertService.showNotification('Something went wrong, please try again', 'error');
          }
        else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        }
        this.restApiService.postAPI('comment/setPublic/' + comment_response['id'] + (this.marked? '/0' : '/1'), {}, ()=>{
          this.mutiple_stories_array[count].comment_array[this.mutiple_stories_array[count].comment_array.length - 1].result.public = this.marked? false: true;
        });
      });
    }
  }

  /*
  * Function to post comment
  */
  postChildComment(story_id,comment_id,count) {
    document.getElementById('child_comment_text_' + comment_id + '_error') ? document.getElementById('child_comment_text_' + comment_id + '_error').innerHTML = '' : '';
    var template = '', post_comment = '';
    if (this.comment_multiple_file_array && this.comment_multiple_file_array.length > 0) {
      this.comment_multiple_file_array.forEach(element => {
        if (element.story_id == parseInt(story_id) && element.comment_type == 'child' && element.comment_id == comment_id) {
          if (element.type == 'image_file') {
            template += '<div name="image"><img data-src="' + element.relative_path + '"/></div>';
          } else if (element.type == 'audio_file') {
            template += '<div name="audio"><audio data-src="' + element.relative_path + '"></audio></div>';
          }
        }
      });
      if (parseInt(comment_id) && document.getElementById('child_comment_text_' + comment_id)) {
        post_comment = (<HTMLInputElement>document.getElementById('child_comment_text_' + comment_id)).value;
        if (post_comment && post_comment.trim()) {
          template += '<div name="text"><p>' + post_comment.trim() + '</p></div>';
        }
      }
    } else {
      if (parseInt(story_id) && document.getElementById('child_comment_text_' + comment_id)) {
        post_comment = (<HTMLInputElement>document.getElementById('child_comment_text_' + comment_id)).value;
        if (post_comment && post_comment.trim()) {
          template = '<div name="text"><p>' + post_comment.trim() + '</p></div>';
        } else {
          document.getElementById('child_comment_text_' + comment_id + '_error') ? document.getElementById('child_comment_text_' + comment_id + '_error').innerHTML = 'Comment field is empty' : '';
          return false;
        }
      } else {
        document.getElementById('child_comment_text_' + comment_id + '_error') ? document.getElementById('child_comment_text_' + comment_id + '_error').innerHTML = 'Comment field is empty' : '';
        return false;
      }
    }
    if (this.user_id && parseInt(comment_id) && parseInt(story_id) && template) {
      let comment_post_details = {
        "parentId": parseInt(comment_id),
        "user": {
          "id": this.user_id,
        },
        "entityMap": {
          "entityContentId": 1,
          "concreteEntityId": parseInt(story_id)
        },
        "comment": template
      };
      this.restApiService.putAPI('comment/update', comment_post_details, (comment_response) => {
        if (comment_response && comment_response['id'] && comment_response.comment) {
          if (document.getElementById('child_comment_text_' + comment_id))
            (<HTMLInputElement>document.getElementById('child_comment_text_' + comment_id)).value = '';

          this.closeChildReplyCommentBox(story_id, comment_id, '');
          this.comment_multiple_file_array.length = 0;
          var check_id_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story_id });
          if (check_id_array.length > 0) {
            if (comment_response.comment && comment_response.user && comment_response.id && comment_response.user.userProfile) {
              var comment_details = this.getCommentsDetails(comment_response.comment);
              if (comment_response.user.userProfile['defaultSnapId']) {
                this.restApiService.getData('snap/' + comment_response.user.userProfile['defaultSnapId'], (snap_details_response) => {
                  if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                    comment_response['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                  }
                });
              } else {
                comment_response['staticDpImg'] = '';
              }
              comment_response['delete_status'] = false;
              if (comment_response.user.id && this.user_id == parseInt(comment_response.user.id)) {
                comment_response['delete_status'] = true;
              }
              check_id_array.forEach(element => {
                var check_child_array = element.comment_array.filter((comments) => { return comments.id == comment_id });
                if (check_child_array && Array.isArray(check_child_array) && check_child_array.length > 0) {
                  check_child_array.forEach(child_element => {
                    if (child_element.result) {
                      child_element.result['emojiStatus'] = false;
                    }
                    if (child_element.child_comment_array && Array.isArray(child_element.child_comment_array)) {
                      var check_array = child_element.child_comment_array.filter((comments) => { return comments.id == comment_id });
                      if (check_array.length == 0) {
                        child_element.child_comment_array.push({ id: comment_response.id, result: comment_response, comment_details: comment_details });
                      }
                    }
                  });
                }
              });
            }
          }
        } else if (comment_response && !comment_response['success'] && comment_response['message']) {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        }
        this.restApiService.postAPI('comment/setPublic/' + comment_response['id'] + (this.marked? '/0' : '/1'), {}, ()=>{
          this.mutiple_stories_array[count].comment_array[this.mutiple_stories_array[count].comment_array.length - 1].result.public = this.marked? false: true;
        });
      });
    }
  }

  /*
  * Function to show delete comment popoup
  */
  showDeleteCommentPopup(story_id, parent_comment_id, comment_type, child_comment_id, comment_text) {
    this.delete_comment_id_details.length = 0;
    this.delete_comment_id_details.push({ story_id: story_id, parent_comment_id: parent_comment_id, comment_type: comment_type, child_comment_id: child_comment_id, comment_text: comment_text });
    $('#delete_comment_modal').modal('show');
  }

  /*
  * Function to delete comment
  */
  deleteComment() {
    if (this.delete_comment_id_details.length == 1) {
      this.delete_comment_id_details.forEach(delete_element => {
        if (parseInt(delete_element.parent_comment_id) && delete_element.comment_type && (delete_element.comment_type == 'parent' || delete_element.comment_type == 'child')) {
          var delete_id = delete_element.comment_type == 'parent' ? delete_element.parent_comment_id : delete_element.child_comment_id;
          this.restApiService.deleteAPI('comment/' + delete_id, (response) => {

            if (delete_element && delete_element.comment_text && delete_element.comment_text.comment_details && Array.isArray(delete_element.comment_text.comment_details) && delete_element.comment_text.comment_details.length > 0) {
              delete_element.comment_text.comment_details.forEach(comment_snap_element => {
                if (comment_snap_element && (comment_snap_element.type == 'image_file' || comment_snap_element.type == 'audio_file')) {
                  if (comment_snap_element.relative_path) {
                    this.awsImageuploadService.deleteFile(comment_snap_element.relative_path, () => { });
                  }
                }
              });
              if (delete_element.comment_text.child_comment_array && Array.isArray(delete_element.comment_text.child_comment_array) && delete_element.comment_text.child_comment_array.length > 0) {
                delete_element.comment_text.child_comment_array.forEach(child_snap_element => {
                  if (child_snap_element && child_snap_element.comment_details && Array.isArray(child_snap_element.comment_details) && child_snap_element.comment_details.length > 0) {
                    child_snap_element.comment_details.forEach(child_snap_element_path => {
                      if (child_snap_element_path && (child_snap_element_path.type == 'image_file' || child_snap_element_path.type == 'audio_file')) {
                        if (child_snap_element_path.relative_path) {
                          this.awsImageuploadService.deleteFile(child_snap_element_path.relative_path, () => { });
                        }
                      }
                    });
                  }
                });
              }
            }

            if (delete_element.comment_type == 'parent') {
              var check_id = this.mutiple_stories_array.filter((stories) => { return stories.id == delete_element.story_id });
              if (check_id.length > 0) {
                check_id.forEach(element => {
                  if (element.comment_array && Array.isArray(element.comment_array) && element.comment_array.length > 0) {
                    var checked_index_value = element.comment_array.findIndex(obj => obj.id == parseInt(delete_element.parent_comment_id));
                    if (checked_index_value > -1) {
                      element.comment_array.splice(checked_index_value, 1);
                    }
                  }
                });
              }
            } else if (delete_element.comment_type == 'child') {
              var check_id = this.mutiple_stories_array.filter((stories) => { return stories.id == delete_element.story_id });
              if (check_id.length > 0) {
                check_id.forEach(element => {
                  if (element.comment_array && Array.isArray(element.comment_array) && element.comment_array.length > 0) {
                    var comment_check_id = element.comment_array.filter(obj => obj.id == parseInt(delete_element.parent_comment_id));
                    if (comment_check_id.length > 0) {
                      comment_check_id.forEach(child_element => {
                        if (child_element.child_comment_array && Array.isArray(child_element.child_comment_array) && child_element.child_comment_array.length > 0) {
                          var checked_index_value = child_element.child_comment_array.findIndex(obj => obj.id == parseInt(delete_element.child_comment_id));
                          if (checked_index_value > -1) {
                            child_element.child_comment_array.splice(checked_index_value, 1);
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
            this.alertService.showAlertBottomNotification('Deleted');
            $('#delete_comment_modal').modal('hide');
            this.delete_comment_id_details.length = 0;
          });
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        }
      });
    }
  }

  /* 
  * Function to show reply comments div element
  */
  showReplyComment(story_id, comment_id) {
    if (story_id && parseInt(story_id) && comment_id && parseInt(comment_id)) {
      var check_id_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story_id });
      if (check_id_array && check_id_array.length > 0 && Array.isArray(check_id_array)) {
        check_id_array.forEach(story_element => {
          var check_child_array = story_element.comment_array.filter((comments) => { return comments.id == comment_id });
          if (check_child_array && check_child_array.length > 0 && Array.isArray(check_child_array)) {
            check_child_array.forEach(child_element => {
              if (child_element.result) {
                child_element.result['replyButtonStatus'] = false;
                child_element.result['disabledChildCommentReply'] = true;
              }
            });
          }
        });
      }
    }
  }

  /* 
  * Function to close Child reply comment box
  */
  closeChildReplyCommentBox(story_id, comment_id, action_type) {
    if (story_id && parseInt(story_id) && comment_id && parseInt(comment_id)) {
      var check_id_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story_id });
      if (check_id_array && check_id_array.length > 0 && Array.isArray(check_id_array)) {
        check_id_array.forEach(story_element => {
          var check_child_array = story_element.comment_array.filter((comments) => { return comments.id == comment_id });
          if (check_child_array && check_child_array.length > 0 && Array.isArray(check_child_array)) {
            check_child_array.forEach(child_element => {
              if (child_element.result) {
                if (document.getElementById('child_comment_text_' + comment_id)) {
                  (<HTMLInputElement>document.getElementById('child_comment_text_' + comment_id)).value = '';
                }
                if (action_type == 'delete') {
                  let checked_array_multiple = this.comment_multiple_file_array.filter(obj => obj.story_id == parseInt(story_id) && obj.comment_type == 'child' && obj.comment_id == comment_id);
                  if (checked_array_multiple && Array.isArray(checked_array_multiple) && checked_array_multiple.length > 0) {
                    checked_array_multiple.forEach(element => {
                      this.delDocType(element.type, story_id, 'child', comment_id, element.relative_path);
                    });
                  }
                }
                child_element.result['replyButtonStatus'] = true;
              }
            });
          }
        });
      }
    }
  }

  /* 
  * Function to show user and child list for commenting purpose
  */
  showCommentBehalfUserList(id) {
    if (document.getElementById(id)) {
      if (document.getElementById(id).style.display == 'block') {
        document.getElementById(id).style.display = 'none';
      } else if (document.getElementById(id).style.display == 'none') {
        document.getElementById(id).style.display = 'block';
      }
    }
  }

  /* 
  * Function to select user who is commenting
  */
  selectCommentByUser(user_id, user_type, id) {
    if (this.user_child_detail_array && this.user_child_detail_array.length > 0) {
      this.user_child_detail_array.forEach(element => {
        element.isChecked = false;
      });
      var check_id = this.user_child_detail_array.filter((user) => { return user.id == user_id && user.user_type == user_type });
      if (check_id.length > 0) {
        check_id.forEach(element => {
          element.isChecked = true;
        });
        if (document.getElementById(id))
          document.getElementById(id).style.display = 'none';
      }
    }
  }

  /* 
  * Function to show or hide comments
  */
  showHideComment(action_type, story_id, comment_type, comment_id) {
    if (story_id && comment_type && action_type) {
      var check_id = this.mutiple_stories_array.filter((stories) => { return stories.id == story_id });
      if (check_id.length > 0) {
        check_id.forEach(element => {
          if (element.comment_array && Array.isArray(element.comment_array) && element.comment_array.length > 0) {
            if (comment_type == 'parent') {
              if (element['comment_display_count'] <= element.comment_array.length) {
                action_type == 'show' ? element['comment_display_count'] -= 2 : 0;
              }
              if (element['comment_display_count'] <= 0) {
                document.getElementById('show_more_comments_parent_div_' + story_id) ? document.getElementById('show_more_comments_parent_div_' + story_id).style.display = 'none' : '';
              }
            } else if (comment_type == 'child') {
              var check_comment_id = element.comment_array.filter((comment) => { return comment.id == comment_id });
              if (check_comment_id && check_comment_id.length > 0) {
                check_comment_id.forEach(child_element => {
                  child_element.child_comment_display_count -= 2;
                  if (child_element.child_comment_display_count <= 0) {
                    document.getElementById('show_more_comments_child_div_' + story_id + '_' + comment_id) ? document.getElementById('show_more_comments_child_div_' + story_id + '_' + comment_id).style.display = 'none' : '';
                  }
                });
              }
            }
          }
        });
      }
    }
  }

  /*
  * Function to upload image, video, pdf based on action type
  */
  uploadConversationDocType(action_type) {
    this.fileInput.nativeElement.value = '';
    if (action_type == 'image') {
      this.fileInput.nativeElement.accept = '.jpg,.png,.jpeg';
    } else if (action_type == 'audio') {
      this.fileInput.nativeElement.accept = '.mp3,.WAV';
    }
    this.click_element_type = 'conversation';
    this.conversation_click_element_type_array.length = 0;
    this.conversation_click_element_type_array.push({ action_type: action_type })
    this.fileInput.nativeElement.click();
  }



  /*
  * Function to show image and make a call to upload to server
  */
  fileChanged(event) {
    if (this.conversation_click_element_type_array.length == 1) {
      this.conversation_click_element_type_array.forEach(element => {
        if (element.action_type) {
          let files = event.target.files;
          let count = 1;
          if (files) {
            for (let file of files) {
              if (element.action_type == 'image' || element.action_type == 'audio') {
                if (this.checkConversationFileExtenstion(file, element.action_type)) {
                  let reader = new FileReader();
                  reader.onload = (e: any) => {
                    if (this.click_element_type == 'conversation') {
                      if (element.action_type == 'image') {
                        this.conversation_multiple_file_array.push({ type: 'image_file', image_src: e.target.result, file_name: file.name, count: count, upload_type: false });
                      } else if (element.action_type == 'audio') {
                        this.conversation_multiple_file_array.push({ type: 'audio_file', audio_src: e.target.result, file_name: file.name, count: count, upload_type: false });
                      }
                      this.saveConverstionToDb(file, element.action_type, count, e.target.result);
                      count++;
                    }
                  }
                  reader.readAsDataURL(file);
                }
              } else {
                this.alertService.showNotification('Something went wrong, Please try again', 'error');
                return false;
              }
            }
          }
        }
      });
    }
  }

  /*
  * Function to save image to database
  */
  saveConverstionToDb(file_data, type_sent, count, data_src) {
    if (this.user_id && file_data && type_sent) {
      this.awsImageuploadService.uploadFileToAWS(file_data, 'story/conversation/' + this.user_id, count, (aws_image_upload_response) => {
        if (aws_image_upload_response && aws_image_upload_response.Location && aws_image_upload_response.key) {
          let check_type;
          if (type_sent == 'image') {
            check_type = 'image_file';
          } else if (type_sent == 'audio') {
            check_type = 'audio_file';
          }
          var check_id_index = this.conversation_multiple_file_array.findIndex((snap) => { return !snap.upload_type && snap.count == count && snap.type == check_type; });
          var check_duplicate_id = this.conversation_multiple_file_array.filter((file) => { return file.relative_path === aws_image_upload_response.key });
          if (check_id_index > -1 && check_duplicate_id.length == 0) {
            if (type_sent == 'image') {
              this.conversation_multiple_file_array.splice(check_id_index, 1, { type: 'image_file', image_src: data_src, file_name: file_data.name, upload_type: true, count: 0, relative_path: aws_image_upload_response.key });
            } else if (type_sent == 'audio') {
              this.conversation_multiple_file_array.splice(check_id_index, 1, { type: 'audio_file', audio_src: data_src, file_name: file_data.name, upload_type: true, count: 0, relative_path: aws_image_upload_response.key });
            }
            this.enablePostConversationButton();
          }
        }
      });
    } else {
      this.alertService.showNotification('Something went wrong, Please try again', 'error');
      return false;
    }
  }

  /* 
  * Function to delete uploaded snap (image, audio)
  */
  delConversationDocType(type, relative_path) {
    if (type && relative_path) {
      var checked_index_value = this.conversation_multiple_file_array.findIndex(obj => obj.relative_path == relative_path && obj.type == type);
      if (checked_index_value > -1) {
        this.conversation_multiple_file_array.splice(checked_index_value, 1);
        this.alertService.showAlertBottomNotification('Deleted');
        this.enablePostConversationButton();
        this.awsImageuploadService.deleteFile(relative_path, () => { });
      } else {
        this.alertService.showNotification('Something went wrong, Please try again', 'error');
        return false;
      }
    } else {
      this.alertService.showNotification('Something went wrong, Please try again', 'error');
      return false;
    }
  }

  /* 
  * Function to enable post conversation button
  */
  enablePostConversationButton() {
    this.conversation_post_button = true;
    if (document.getElementById('conversion_text_element') && this.tagged_conversation_users.length > 0) {
      let post_comment = (<HTMLInputElement>document.getElementById('conversion_text_element')).value;
      if (post_comment && post_comment.trim()) {
        this.conversation_post_button = false;
      }
      if (this.conversation_post_button) {
        if (this.conversation_multiple_file_array && this.conversation_multiple_file_array.length > 0) {
          let break_status = true;
          this.conversation_multiple_file_array.forEach(element => {
            if (element.upload_type && break_status) {
              this.conversation_post_button = false;
              break_status = false;
            }
          });
        }
      }
    }
  }

  /* 
  * Function to enable post conversation button
  */
  assignedConversationSchoolDetails() {
    this.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response) => {
      if (response && response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
        response['schoolDetail'].forEach(element => {
          if (element.school.id && element.school.name && element.role) {
            var check_id = this.conversation_school_list_array.filter((details) => { return details.id === element.school.id });
            if (check_id.length == 0) {
              let staticSchoolDpImg = '';
              if (element['defaultSnapId']) {
                this.restApiService.getData('snap/' + element['defaultSnapId'], (snap_details_response) => {
                  if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                    staticSchoolDpImg = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                  }
                });
              }
              this.conversation_school_list_array.push({ id: element.school.id, name: element.school.name, role: element.role, staticSchoolDpImg: staticSchoolDpImg, isChecked: false })
            }
          }
        });
        this.conversationStorySelectSchool(this.conversation_selected_school_id);
      }
    });
  }

  /*
  * Function to select the school
  * while creating the conversation type story
  */
  conversationStorySelectSchool(school_id) {
    this.conversation_school_list_array.forEach(element => {
      if (element.id !== school_id) {
        element.isChecked = false;
      }
    });
    var check_id = this.conversation_school_list_array.filter((details) => { return details.id === parseInt(school_id) && details.isChecked === true });
    if (check_id.length == 0) {
      var index_value = this.conversation_school_list_array.findIndex(obj => obj.id == parseInt(school_id));
      if (index_value > -1) {
        if (typeof this.conversation_school_list_array[index_value] !== 'undefined') {
          this.conversation_school_list_array[index_value]['isChecked'] = true;
        }
      }
    } else {
      var index_value = this.conversation_school_list_array.findIndex(obj => obj.id == parseInt(school_id));
      if (index_value > -1) {
        if (typeof this.conversation_school_list_array[index_value] !== 'undefined') {
          this.conversation_school_list_array[index_value]['isChecked'] = false;
        }
      }
    }
    var check_id_selected = this.conversation_school_list_array.filter((details) => { return details.id === parseInt(school_id) && details.isChecked === true });
    if (check_id_selected && Array.isArray(check_id_selected) && check_id_selected.length > 0) {
      check_id_selected.forEach(element => {
        if (element.role && Array.isArray(element.role) && element.role.length > 0) {
          let admin_check_index_value = element.role.findIndex(obj => obj == 'ADMIN');
          if (admin_check_index_value > -1) {
            this.conversation_story_created_by_role = 'ADMIN';
          }
          if (this.conversation_story_created_by_role !== 'ADMIN') {
            let teacher_check_index_value = element.role.findIndex(obj => obj == 'TEACHER');
            if (teacher_check_index_value > -1) {
              this.conversation_story_created_by_role = 'TEACHER';
            }
            if (this.conversation_story_created_by_role !== 'TEACHER') {
              let teacher_check_index_value = element.role.findIndex(obj => obj == 'PARENT');
              if (teacher_check_index_value > -1) {
                this.conversation_story_created_by_role = 'PARENT';
              }
            }
          }
        }
      });
      this.getSchoolParent((parent_response) => {
        if (parent_response) {
          this.getSchoolTeacher((teacher_response) => {
            if (teacher_response) {
              this.getSchoolAdmin((admin_response) => {
                if (admin_response) {
                  this.conversation_users_array = [];
                  this.conversation_users_array = this.conversation_users_array.concat(this.conversation_school_parent_array);
                  this.conversation_users_array = this.conversation_users_array.concat(this.conversation_school_teacher_array);
                  this.conversation_users_array = this.conversation_users_array.concat(this.conversation_school_admin_array);
                }
              });
            }
          });
        }
      });
    }
  }

  /*
  * Function to get School Teacher
  */
  getSchoolTeacher(callback) {
    if (this.conversation_selected_school_id && (this.conversation_story_created_by_role == 'ADMIN' || this.conversation_story_created_by_role == 'TEACHER')) {
      this.restApiService.getData('teacher/request/school/' + this.conversation_selected_school_id, (school_teacher_response) => {
        if (school_teacher_response && Array.isArray(school_teacher_response) && school_teacher_response.length > 0) {
          school_teacher_response.forEach(element => {
            if (element.teacher && element.user && element.user.userProfile) {
              if (this.user_id !== element.user.id) {
                var check_id = this.conversation_school_teacher_array.filter((details) => { return details.id === element.user.id; });
                if (check_id.length == 0) {
                  var teacher = [];
                  teacher['id'] = element.user.id;
                  teacher['name'] = element.user.userProfile.firstName + " " + element.user.userProfile.lastName;
                  if (element.user.userProfile['defaultSnapId']) {
                    this.restApiService.getData('snap/' + element.user.userProfile['defaultSnapId'], (snap_details_response) => {
                      if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                        teacher['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                      }
                    });
                  } else {
                    teacher['staticDpImg'] = '';
                  }
                  teacher['type'] = 'school_teacher';
                  teacher['sort_type'] = 'Select Office Bearers';
                  teacher['display_sort_type'] = 'All school teacher';
                  this.conversation_school_teacher_array.push(teacher);
                }
              }
            }
          });
          return callback && callback(true);
        } else {
          return callback && callback(true);
        }
      });
    } else {
      return callback && callback(true);
    }
  }

  /*
  * Function to get School Admin
  */
  getSchoolAdmin(callback) {
    if (this.conversation_selected_school_id && this.conversation_story_created_by_role == 'ADMIN') {
      this.restApiService.getData('user/admin/requests/bySchool/' + this.conversation_selected_school_id, (response) => {
        if (response && Array.isArray && response.length > 0) {
          response.forEach(element => {
            if (element.admin && element.user && element.user.id && element.user.userProfile) {
              if (this.user_id !== element.user.id) {
                var check_id = this.conversation_school_admin_array.filter((details) => { return details.id === element.user.id; });
                if (check_id.length == 0) {
                  var admin = [];
                  admin['id'] = element.user.id;
                  admin['name'] = element.user.userProfile.firstName + " " + element.user.userProfile.lastName;
                  if (element.user.userProfile['defaultSnapId']) {
                    this.restApiService.getData('snap/' + element.user.userProfile['defaultSnapId'], (snap_details_response) => {
                      if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                        admin['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                      }
                    });
                  } else {
                    admin['staticDpImg'] = '';
                  }
                  admin['type'] = 'school_admin';
                  admin['sort_type'] = 'Select all Executive';
                  admin['display_sort_type'] = 'All school admin';
                  this.conversation_school_admin_array.push(admin);
                }
              }
            }
          });
          return callback && callback(true);
        } else {
          return callback && callback(true);
        }
      });
    } else {
      return callback && callback(true);
    }
  }

  /*
  * Function to get School Parent
  */
  getSchoolParent(callback) {
    if (this.conversation_selected_school_id && (this.conversation_story_created_by_role == 'ADMIN' || this.conversation_story_created_by_role == 'TEACHER')) {
      this.restApiService.getData('user/getStudentsBySchool/' + this.conversation_selected_school_id, (response) => {
        if (response && Array.isArray(response) && response.length > 0) {
          response.forEach(element => {
            if (element.status && element.child && element.child.users && Array.isArray(element.child.users) && element.child.users.length > 0) {
              element.child.users.forEach(school_parent_element => {
                if (this.user_id !== school_parent_element.id) {
                  let check_id = this.conversation_school_parent_array.filter((details) => { return details.id === school_parent_element.id; });
                  if (check_id.length == 0) {
                    let parent = [];
                    parent['id'] = school_parent_element.id;
                    parent['name'] = school_parent_element.userProfile.firstName + " " + school_parent_element.userProfile.lastName;
                    if (school_parent_element.userProfile['defaultSnapId']) {
                      this.restApiService.getData('snap/' + school_parent_element.userProfile['defaultSnapId'], (snap_details_response) => {
                        if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                          parent['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                        }
                      });
                    } else {
                      parent['staticDpImg'] = '';
                    }
                    parent['type'] = 'school_parent';
                    parent['sort_type'] = 'Select Member';
                    parent['display_sort_type'] = 'All school parent';
                    this.conversation_school_parent_array.push(parent);
                  }
                }
              });
            }
          });
          return callback && callback(true);
        } else {
          return callback && callback(true);
        }
      });
    } else {
      return callback && callback(true);
    }
  }

  /*
  * Function to show Conversation emoji
  */
  showConversationEmoji() {
    this.conversation_emojiStatus = !this.conversation_emojiStatus;
  }

  /*
  * Function to add Conversation emoji
  */
  addConversationEmoji(event: EmojiEvent) {
    if (document.getElementById('conversion_text_element')) {
      (<HTMLInputElement>document.getElementById('conversion_text_element')).value += event.emoji.native;
      this.enablePostConversationButton();
    }
  }

  /*
  * Function to post Conversation story
  */
  postConversationStory() {
    if (document.getElementById('conversion_text_element') && this.conversation_selected_school_id) {
      let post_comment = (<HTMLInputElement>document.getElementById('conversion_text_element')).value;
      let template = '<div name="story_content" style="background-color:#fff">'; let tagged_users_array = [];
      if ((post_comment && post_comment.trim()) || this.conversation_multiple_file_array.length > 0) {
        if (post_comment && post_comment.trim()) {
          template += '<div name="text"><p>' + post_comment.trim() + '</p></div>';
        }
        this.conversation_multiple_file_array.forEach(element => {
          if (element && element.relative_path) {
            if (element.type == 'image_file') {
              template += '<div name="image"><img data-src="' + element.relative_path + '"/></div>';
            } else if (element.type == 'audio_file') {
              template += '<div name="audio"><audio data-src="' + element.relative_path + '"></audio></div>';
            }
          }
        });
        template += '</div>';
        if (template) {
          if (this.tagged_conversation_users.length > 0) {
            this.tagged_conversation_users.forEach(element => {
              if (element == 'Select all school parent') {
                this.conversation_school_parent_array.forEach(school_parent_element => {
                  let check_parent_id_array = tagged_users_array.findIndex((user_id) => { return user_id == school_parent_element.id; })
                  if (check_parent_id_array == -1) {
                    tagged_users_array.push(school_parent_element.id);
                  }
                });
              } else if (element == 'Select all school admin') {
                this.conversation_school_admin_array.forEach(school_admin_element => {
                  let check_admin_id_array = tagged_users_array.findIndex((user_id) => { return user_id == school_admin_element.id; })
                  if (check_admin_id_array == -1) {
                    tagged_users_array.push(school_admin_element.id);
                  }
                });
              } else if (element == 'Select all school teacher') {
                this.conversation_school_teacher_array.forEach(school_teacher_element => {
                  let check_teacher_id_array = tagged_users_array.findIndex((user_id) => { return user_id == school_teacher_element.id; })
                  if (check_teacher_id_array == -1) {
                    tagged_users_array.push(school_teacher_element.id);
                  }
                });
              } else {
                let check_tagged_users_array = tagged_users_array.findIndex((user_id) => { return user_id == element; });
                if (check_tagged_users_array == -1) {
                  tagged_users_array.push(element);
                }
              }
            });
            this.publishConversationStory(template, tagged_users_array);
          } else {
            this.alertService.showNotification('Please add atleast one person', 'error');
            return false;
          }
        }
      } else {
        this.alertService.showNotification('Something went wrong, please try again', 'error');
      }
    } else {
      this.conversation_selected_school_id ? this.alertService.showNotification('Something went wrong, please try again', 'error') : this.alertService.showNotification('Please select school', 'error');
    }
  }

  private publishConversationStory(template, tagged_users_array) {
    if (this.conversation_selected_school_id && this.user_id && template && tagged_users_array) {
      var status = 'DRAFTED';
      var save_story = {
        "schoolId": this.conversation_selected_school_id,
        "userId": this.user_id,
        "caption": '',
        "text": template,
        "status": status,
        "userCreatedAt": new Date(),
        "type": 'STORY',
        "taggedStudent": [],
        "taggedSnaps": [],
        "associatedTags": []
      }
      this.restApiService.postAPI('story/add', save_story, (first_story_add_response) => {
        if (first_story_add_response && first_story_add_response.id) {
          if (tagged_users_array && Array.isArray(tagged_users_array) && tagged_users_array.length > 0) {
            var user_tagged = {
              "userIds": tagged_users_array
            }
            this.restApiService.postAPI('story/' + first_story_add_response.id + '/tagUsers', user_tagged, (tagged_user_response) => {
            });
          }
          if (first_story_add_response.id) {
            if (this.conversation_story_created_by_role == 'ADMIN' || this.conversation_story_created_by_role == 'TEACHER') {
              this.restApiService.postAPI(`story/${first_story_add_response.id}/state/submit`, {}, (submit_response) => {
                if (submit_response && submit_response['success']) {
                  this.restApiService.postAPI(`story/${first_story_add_response.id}/state/publish`, {}, (publish_response) => {
                    if (publish_response && publish_response['success']) {
                      this.alertService.showAlertBottomNotification("Conversation published");
                      // return this.router.navigateByUrl('/activity');
                      this.clearConversationStoryDetails((clear_response) => {
                        if (clear_response) {
                          this.ngOnInit();
                        }
                      });
                    } else {
                      this.alertService.showNotification('Something went wrong, please try again', 'error');
                      return false;
                    }
                  });
                } else {
                  this.alertService.showNotification('Something went wrong, please try again', 'error');
                  return false;
                }
              });
            } else if (this.conversation_story_created_by_role == 'PARENT') {
              this.restApiService.postAPI(`story/${first_story_add_response.id}/state/submit`, {}, (submit_response) => {
                if (submit_response && submit_response['success']) {
                  this.alertService.showAlertBottomNotification('Conversation submitted, waiting for admin to approve');
                  // return this.router.navigateByUrl('/activity');
                  this.clearConversationStoryDetails((clear_response) => {
                    if (clear_response) {
                      this.ngOnInit();
                    }
                  });
                } else {
                  this.alertService.showNotification('Something went wrong, please try again', 'error');
                  return false;
                }
              });
            }
          }
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
          return false;
        }
      });
    }
  }

  /*
  * change conversation selection school
  */
  onChangeSelectConversationSchool(event) {
    if (event) {
      this.conversation_selected_school_id = event;
      this.conversationStorySelectSchool(this.conversation_selected_school_id);
      this.conversation_disabled_status = true;
    }
  }

  /*
  * Clear conversation disbabled attribute
  */
  clearConversationDisabledAttribute() {
    this.clearConversationStoryDetails((clear_response) => {
      if (clear_response) {
        this.assignedConversationSchoolDetails();
        this.conversation_disabled_status = false;
      }
    });

  }

  /*
  * Clear conversation story details
  */
  clearConversationStoryDetails(callback) {
    this.conversation_multiple_file_array.length = 0;
    this.conversation_emojiStatus = false;
    this.conversation_post_button = true;
    this.conversation_selected_school_id = this.selected_school_id;
    this.conversation_school_list_array = new Array();
    this.conversation_story_created_by_role = '';
    this.conversation_school_teacher_array.length = 0;
    this.conversation_school_parent_array.length = 0;
    this.conversation_users_array = [];
    this.tagged_conversation_users = [];
    // this.conversation_disabled_status = false;

    this.click_element_type = '';
    this.conversation_click_element_type_array.length = 0;
    if (document.getElementById('conversion_text_element')) {
      (<HTMLInputElement>document.getElementById('conversion_text_element')).value = '';
    }
    return callback && callback(true);
  }



  /*
  * Default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /*
  * Show emoji
  */
  showEmoji(story_id, type, comment_id) {
    if (story_id && parseInt(story_id) && type) {
      var check_id_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story_id });
      if (check_id_array && check_id_array.length > 0 && Array.isArray(check_id_array)) {
        check_id_array.forEach(element => {
          if (type == 'parent') {
            element.emojiStatus = !element.emojiStatus;
          } else if (type == 'child') {
            var check_child_array = element.comment_array.filter((comments) => { return comments.id == comment_id });
            if (check_child_array && check_child_array.length > 0 && Array.isArray(check_child_array)) {
              check_child_array.forEach(child_element => {
                if (child_element.result) {
                  child_element.result['emojiStatus'] = !child_element.result['emojiStatus'];
                }
              });
            }
          }
        });
      }
    }
  }

  /*
  * Adding emoji to comment area
  */
  addEmoji(event: EmojiEvent, story_id, type, comment_id) {
    if (type && type == 'parent' && story_id && parseInt(story_id) && document.getElementById('comment_text_' + story_id)) {
      (<HTMLInputElement>document.getElementById('comment_text_' + story_id)).value += event.emoji.native;
      this.showPostButton(story_id, type, 0);
    } else if (type && type == 'child' && comment_id && story_id && document.getElementById('child_comment_text_' + comment_id)) {
      (<HTMLInputElement>document.getElementById('child_comment_text_' + comment_id)).value += event.emoji.native;
      this.showPostButton(story_id, type, comment_id);
    }
  }

  /*
  * Modal gallery popup
  */
  modal_images: Image[] = [];
  openImageModal(image_array, image_src) {
    this.modal_images = [];
    if (image_array && Array.isArray(image_array) && image_array.length > 0 && image_src) {
      image_array.forEach(element => {
        if (element.type == 'image_file') {
          var check_id = this.modal_images.filter((details) => { return details.id === element.image_src });
          if (check_id.length == 0) {
            const newImage: Image = new Image(element.image_src, { 'img': element.image_src });
            this.modal_images.push(newImage);
            this.galleryService.updateGallery(1, this.modal_images.length - 1 + 1, newImage)
          }
        }
      });
      var checked_index_value = this.modal_images.findIndex(obj => obj.id == image_src);
      if (checked_index_value > -1) {
        setTimeout(() => { this.galleryService.openGallery(1, checked_index_value); }, 1);
      }
    }
  }

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event) {
    this.helperService.updateDefaultImageUrlHelper(event);
  }

  async getStories() {
    return new Promise(resolve => {
      this.restApiService.getData(`story/query?status=PUBLISHED&userId=${this.user_id}&sort=updatedAt,desc&page=${this.story_offset}&size=${this.story_limit}`, async (response) => {
        if (response && Array.isArray(response.content) && response.content.length > 0) {
          this.maxElements = response.totalElements;
          this.story_offset ++;
          resolve(response.content);
        }
        else {
          this.isOnlyAttendee = true;
          if(!this.authenticateService.isSuperAdmin()) this.normalUser = false;
          var storyDetArray = new Array();
          var vistiedStories = this.storageService.getStoredData('visitedEvents')
          var stories = [];
          if(Array.isArray(vistiedStories)){
            let count = 2;
            
            for(; (this.currentVisitedIndex < vistiedStories.length) && (count>0);){
              stories.push(vistiedStories[this.currentVisitedIndex]);
              count--;
              this.currentVisitedIndex++;
            }
          }
          
          if(Array.isArray(stories)){
            for (const storyId of stories) {
              var story = await this.getStoryForId(storyId);
              storyDetArray.push(story);
            }
            resolve(storyDetArray);
          }else resolve([]);
          
        }

        // this.alertService.hideLoader();
        this.loadingStories = false;
      });
    })
  }

  getStoryForId(storyId: number) {
    return new Promise((resolve) => {
      this.restApiService.getData('story/detailed/' + storyId, (detailedStory) => {
        console.log(detailedStory);
        resolve(detailedStory);
      })
    })
  }

  toggleVisibility(e){
    this.marked= e.target.checked;
  }

}
