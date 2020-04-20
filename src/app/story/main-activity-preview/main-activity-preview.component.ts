import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation, AfterViewInit, HostListener, } from '@angular/core';
import { AWS_DEFAULT_LINK } from '../../config';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute, RouteReuseStrategy } from '@angular/router';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../_services';
import { HelperService } from '../../_helpers';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { GalleryService, Image, ButtonsConfig, ButtonsStrategy } from '@ks89/angular-modal-gallery';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji/public_api';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';
import { Meta } from '@angular/platform-browser';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { CustomRouteReuseStrategy } from 'src/app/_services/CustomRouteReuseStrategy';
import { take } from 'rxjs/operators';
import { TicketBookingService } from 'src/app/_services/ticket-booking.service';
import { TicketGenerationService } from 'src/app/_services/ticket-generation.service';
import { SeoService } from 'src/app/_services/seo.service';

declare let $: any;

@Component({
  selector: 'app-main-activity-preview',
  templateUrl: './main-activity-preview.component.html',
  styleUrls: ['./main-activity-preview.component.scss'],
  providers: [DatePipe, {provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy}],
  encapsulation: ViewEncapsulation.None,
  
})
export class MainActivityPreviewComponent implements OnInit {

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    console.log('Back button pressed');
  }
  private unsubscribe$ = new Subject();
  nav_links = new Array<{ text: string, additional_text: string, font_icon:string, click: string, click_params: any }>();
  @ViewChild('story_content') story_content: ElementRef;
  @ViewChild('story_content_filter') story_content_filter: ElementRef;
  @ViewChild('story_comment_content') story_comment_content: ElementRef;
  @ViewChild('story_header_content') story_header_content: ElementRef;
  logged_status: boolean = false;
  user_child_detail_array = new Array();
  comment_multiple_file_array = new Array();
  mutiple_stories_array = new Array();
  student_array = new Array();
  story_array = new Array();
  multiple_file_array = new Array();
  teacher_user_tagged_array = new Array();
  story_id: number;
  user_id: number;
  school_id: number;
  selected_school_id: number;
  story_school_array = new Array();
  school_details;
  story_type_admin_parent_status = false;
  story_type_array = new Array();
  story_date_status = false;
  story_expiry_date_status = false;
  disable_select_school = true;
  currentPage = 0;
  pageSize: number = 2;
  hasMoreStories: boolean = true;
  loadingStories: boolean = false;
  today = new Date();
  showBreakDown = false;
  story_school_error_status = false;
  story_type_error_status = false;
  story_created_date_error_status = false;
  story_expiry_date_error_status = false;
  story_created_by_role: string;
  story_creation_popup_error = false;
  UserName:string;
  bookedBy: any = "";
  isLoggedSession: boolean = false;
  userProfilename:string;
  // UsernameEmail:string;
  loggedUserName: string;
  /* user story Created date */
  user_story_created_date: any = new Date();

  /* user story expiry date */
  user_story_expiry_date: any = new Date();

  public datepickerConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  delete_comment_id_details = new Array();
  comment_display_type: string = 'public';
  approval_page_status = false;
  bookingInProgress: boolean = false;
  story_background_color: string = "#ffffff";

  default_story_popup_details = new Array();
  marker = new Array();
  // google maps zoom level
  zoom: number = 15;
 
  marked = false;
  theCheckbox = false;

  // initial center position for the map
  lat: number = 12.9542944;
  lng: number = 77.4905086;
  name: string;
  address: string;
  addressSecondary: string;
  city: string;
  // emailRegex: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  emailRegex: RegExp = /[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}/;
  showNotified = false;
  normalUser = true;
  userSchool = [];
  userEmail:string;
  // commentUserName:string;
  // ticket_count_number_array = new Array(0,1,2,3,4,5,6,7,8,9,10);
  ticket_price_with_details_array = new Array();
  // test : boolean = true;
  
  constructor(
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private router: Router,
    public route: ActivatedRoute,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private helperService: HelperService,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private galleryService: GalleryService,
    private awsImageuploadService: AwsImageUploadService,
    private meta: Meta,
    private storageService: LocalStorageService,
    private ticketGenerationService: TicketGenerationService,
    private seoService: SeoService
  ) {}

  /*
  * Default Angular Life cycle method
  */
  ngOnInit() {
    this.nav_links.push({ text: '', additional_text:'Close', font_icon:'<i class="fa fa-times"></i>', click:'closeActivityPreview', click_params: '' });
    
    if ((this.router.url && this.router.url.indexOf('admin/school/activity/approvals/preview') > -1) || this.authenticateService.isSuperAdmin()) {
      this.approval_page_status = true;
      this.nav_links.push({ text: 'Publish', additional_text:'', font_icon:'',  click: 'updateStory', click_params: '' });
      this.nav_links.push({ text: 'Reject', additional_text:'', font_icon:'', click: 'rejectStory', click_params: '' });
    }
    this.datepickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'DD/MM/YYYY',
      });
    if (this.dataService.hasUserId()) {
      this.user_id = this.dataService.hasUserId();
    } else {
      console.log("Setting user_id =0");
      this.user_id = 0;
      // this.helperService.goBack();
    }
    // console.log(this.nav_links);
    // this.story_type_array.push({type:'STORY', display:'STORY', isChecked:false});
    this.story_type_array.push({ type: 'COMMUNITY_POST', display: 'BLOG POST', isChecked: false });
    // this.story_type_array.push({type:'LEARNING_NOTE', display:'CHILD NOTE', isChecked:false});
    this.story_type_array.push({ type: 'ADVERTISEMENT', display: 'SCHEDULE AN EVENT', isChecked: false });

    if (this.dataService.hasSchoolId()) {
      this.selected_school_id = this.dataService.hasSchoolId();
    }

    this.route.paramMap.takeUntil(this.unsubscribe$).subscribe(params => {
      // console.log('this is where we compare the queries: ' + this.story_id + ' : ' + parseInt(params.get('id')));
      // if(this.story_id && this.story_id == parseInt(params.get('id'))) return;
      
      this.story_id = this.resolveStoryId(params.get('id'));
      var editIndex = this.nav_links.findIndex((item) => { return item.text == 'Edit' });
      if (editIndex > -1) this.nav_links.splice(editIndex, 2);
      if (!isNaN(this.story_id)) {
        var obj = this;
        obj.logged_status = false;
        this.story_array = [];
        this.multiple_file_array = [];
        this.teacher_user_tagged_array = [];
        obj.showPreviewDetails(this.story_id);
        obj.getUserChildDetails();

        obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response:any) => {
          console.log(response);
          console.log('logged user details');
          if (response) {
            if (response['user'] && response['user']['id']) {
              obj.userEmail = response['user']['email'];
              var EmailName = obj.userEmail.substring(0, obj.userEmail.lastIndexOf("@"));
              obj.logged_status = true;
              this.userSchool = response.schoolDetail;
              this.authenticateService.getSelectedSchoolDetails((school_details_response) => {
                this.school_details = school_details_response;
                this.bookedBy = response['user']['email'];
                this.isLoggedSession = true;             
              });
              if (response.user.userProfile.firstName) {
                this.userProfilename = response.user.userProfile.firstName;
              } else this.userProfilename = EmailName;
              if (response.user.userProfile.firstName) { 
                this.loggedUserName = response.user.userProfile.firstName + " " + response.user.userProfile.lastName;
              } else this.loggedUserName = response.user.email;
            }           
          } else {
            obj.logged_status = false;
          }
          
        });
      }
    });
///////untill 

  }

  /*
  * Function to show preview details
  */


  showPreviewDetails(id) {
    console.log(id)
    console.log('show preview called');
    this.alertService.showLoader();
    console.log("User_ID: " + this.user_id);
    if (this.user_id == undefined) {
      this.user_id = 0;
    }

    if (this.story_id) {
      
      this.restApiService.getData('story/detailed/' + id, (response) => {
        if (response && response.id) {
          this.storageService.addVisitedEvent(this.story_id);
          this.restApiService.getData(`story/${this.story_id}/priviliges/user/${this.user_id}`, (access_response) => {
            if (access_response && (access_response.id || access_response.storyId)) {
              if (access_response.read1) {
                let story = response;
                if(response.status == 'DRAFTED'){
                  var check_index_value = this.nav_links.findIndex((check_id) => { return check_id.additional_text === "Submit"; });
                  if (check_index_value > -1) {
                    this.nav_links.splice(check_index_value,1);
                  }
                  this.nav_links.push({ text: '', additional_text:'Submit', font_icon:'', click: 'submitDraftEvent', click_params: { 'story_id': this.story_id, 'school_id': response.schoolId, 'story_type': response.type, 'user_story_created_date': response.userCreatedAt, 'user_story_expiry_date': response.expireAt } });
                }              
                if ((access_response.edit1 && response.schoolId) || this.authenticateService.isSuperAdmin() ) {
                  this.school_id = response.schoolId;
                  var check_index_value = this.nav_links.findIndex((check_id) => { return check_id.additional_text === "Edit"; });
                  if (check_index_value > -1) {
                    this.nav_links.splice(check_index_value,1);
                  } this.normalUser = false;
                  this.nav_links.push({ text: '', additional_text:'Edit', font_icon:'<i class="fa fa-pencil-square-o"></i>', click: 'editActivityPopup', click_params: { 'story_id': this.story_id, 'school_id': response.schoolId, 'story_type': response.type, 'user_story_created_date': response.userCreatedAt, 'user_story_expiry_date': response.expireAt } });
                }
                // display school stories card same organization
                if (response.schoolId) {
                  this.userSchool.forEach(schoolObj => {
                    if(this.school_id == schoolObj.school.id) this.showNotified = true;
                  });  
                  this.school_id = response.schoolId;
                  this.showStories();
                }
                // display school stories card same organization
                // if (access_response.write1) {
                //   var check_index_value = this.nav_links.findIndex((check_id) => { return check_id.additional_text === "Delete"; });
                //   if (check_index_value > -1) {
                //     this.nav_links.splice(check_index_value,1);
                //   }
                //   this.nav_links.push({ text: '', additional_text:'Delete', font_icon:'<i class="fa fa-trash"></i>', click:'deleteActivityPopup', click_params: { 'story_id': this.story_id, 'story_text': response.text } });
                // }

                if (story.caption != '' && story.caption) {
                  //adding title metadata
                  var cap = this.helperService.getEventTitle(story.caption);
                  story.caption = this.sanitizer.bypassSecurityTrustHtml(story.caption);
                  this.alertService.setTitle(cap);
                  this.seoService.updateTags({title: cap})
                  this.seoService.updateTags({description: 'Buy tickets for event, ' + cap});
                }
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
                console.log("Break point 1");
                this.story_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.text);

                var container = this.story_content.nativeElement.querySelectorAll('div');
                var container_main_array = Array.prototype.slice.call(container);
                var metaContent = '';
                container_main_array.forEach((main_element, x) => {
                  if (main_element.getAttribute("name") == "text") {

                    if (main_element.innerHTML) {
                      try {
                        console.log("Error check 1");
                        var text_value = JSON.parse(main_element.innerHTML);
                        if (text_value && text_value.title && text_value.content) {
                          this.multiple_file_array.push({ type: 'text_file', title: this.sanitizer.bypassSecurityTrustHtml(unescape(text_value.title)), description: this.sanitizer.bypassSecurityTrustHtml(unescape(text_value.content)) });
                          if (!metaContent) metaContent = unescape(text_value.content);
                        }
                      } catch (e) {

                        console.log("Error 1: JSON Parse", e);
                        return false;
                      }
                    }
                  }
                  if (main_element && main_element.style && main_element.style.backgroundColor) {
                    this.story_background_color = main_element.style.backgroundColor;
                  }
                  console.log("Break point 2");
                  var container_child_array = Array.prototype.slice.call(main_element.children);
                  container_child_array.every(child_element => {
                    // if(child_element.tagName=="P"){
                    //   this.multiple_file_array.push({type:'text_file',text_data:this.sanitizer.bypassSecurityTrustHtml(main_element.innerHTML),text_content:main_element.innerHTML});  
                    // }else 
                    if (child_element.tagName == "IMG") {
                      if (child_element.dataset.src) {
                        this.multiple_file_array.push({ type: 'image_file', image_src: AWS_DEFAULT_LINK + child_element.dataset.src });
                      }
                    } else if (child_element.tagName == "VIDEO") {
                      if (child_element.dataset.src) {
                        this.multiple_file_array.push({ type: 'video_file', video_src: AWS_DEFAULT_LINK + child_element.dataset.src });
                      }
                    } else if (child_element.tagName == "EMBED") {
                      if (child_element.dataset.src) {
                        this.multiple_file_array.push({ type: 'pdf_file', pdf_src: this.sanitizer.bypassSecurityTrustResourceUrl(AWS_DEFAULT_LINK + child_element.dataset.src + '#view=FitH') });
                      }
                    } else if (child_element.tagName == "AUDIO") {
                      if (child_element.dataset.src) {
                        this.multiple_file_array.push({ type: 'audio_file', audio_src: AWS_DEFAULT_LINK + child_element.dataset.src });
                      }
                    }
                  });
                });
                
                if (response.children && Array.isArray(response.children) && response.children.length > 0) {
                  response.children.forEach(element => {
                    if (element && element.id) {
                      var check_id = this.student_array.filter((child) => { child.id == element.id });
                      if (check_id.length == 0) {
                        var child = [];
                        child['id'] = element.id;
                        child['firstName'] = element.firstName;
                        child['lastName'] = element.lastName;
                        if (element['defaultSnapId']) {
                          this.restApiService.getData('snap/' + element['defaultSnapId'], (snap_details_response) => {
                            if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                              child['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                            }
                          });
                        } else {
                          child['staticDpImg'] = false;
                        }
                        this.student_array.push(child);
                      }
                    }
                  });
                }
                console.log("Break point 4");
                if (response.veneus && Array.isArray(response.veneus) && response.veneus.length > 0) {
                  response.veneus.forEach((address_element, key) => {
                    if (address_element && key == 0) {
                      this.lat = address_element.lat;
                      this.lng =  address_element.lng;
                      this.name =  address_element.name;
                      this.address =  address_element.address;
                      this.addressSecondary = address_element.addressSecondary;
                      this.city = address_element.city;
                      this.marker = [{
                          lat: this.lat,
                          lng: this.lng,
                          label: '',
                          draggable: true,
                          name: this.name,
                          address: this.address,
                          addressSecondary: this.addressSecondary,
                          city: this.city
                        }];
                    }
                  });
                }
                console.log("Break point 5");
                if (story.capacities && Array.isArray(story.capacities) && story.capacities.length > 0) {
                  story.capacities.forEach((capacities_element, key) => {
                    story.capacities[key]['ticketSelectedCount'] = 0;
                  });
                }
                var previousSelectedTickets = this.ticketGenerationService.getTicketSelection();
                
                //sort capacities based on start date
                if(Array.isArray(story.capacities)) story.capacities.sort((a,b)=>{
                  var aDate = new Date(a.duration.utcStart);
                  var bDate = new Date(b.duration.utcStart);
                  if(aDate.getTime() == bDate.getTime()){ return a.id - b.id}
                  else return new Date(a.duration.utcStart).getTime() - (new Date(b.duration.utcStart).getTime());
                })
                //previously selected tickets are retrieved
                this.ticket_information_details = [];
                if(previousSelectedTickets.length > 0){
                  story.capacities.forEach((capacity, x) => {
                    var index = previousSelectedTickets.findIndex((selection)=>{return selection.capacityId == capacity.id});
                    if(index != -1 && this.checkIfCapacityAvailable(capacity, previousSelectedTickets[index].selectedCount)){
                      capacity.ticketSelectedCount = previousSelectedTickets[index].selectedCount;
                      this.onChangeSelectTicketNumber(0, story.capacities[x])
                    }
                  });
                  // story.capacities[0].ticketSelectedCount = 1;
                  // this.onChangeSelectTicketNumber(1, story.capacities[0]);
                }

                // Comment Part
                story['comment_array'] = [];
                story['disabledCommentPost'] = true;
                story['emojiStatus'] = false;
                story['comment_display_count'] = 0;
                console.log("Break point 6");
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
                        if( (comment_element.value.user.id && this.user_id == parseInt(comment_element.value.user.id)) || this.authenticateService.isSuperAdmin() ){
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
                              if ((child_element.value.user.id && this.user_id == parseInt(child_element.value.user.id)) || this.authenticateService.isSuperAdmin() ) {
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

                      }
                      story['comment_display_count'] = (story['comment_array'] ? (story['comment_array'].length > 2 ? story['comment_array'].length - 2 : 0) : 0);
                    });
                  }
                });
                this.restApiService.getData(`story/${this.story_id}/permittedUsers`, (permittedUsers) => {
                  if (permittedUsers && Array.isArray(permittedUsers) && permittedUsers.length > 0) {
                    permittedUsers.forEach(element => {
                      if (element && element.id !== permittedUsers['id']) {
                        var check_id = this.teacher_user_tagged_array.filter((child) => { child.id == element.id });
                        if (check_id.length == 0) {
                          var user = [];
                          user['id'] = element.id;
                          user['firstName'] = element.firstName;
                          user['lastName'] = element.lastName;
                          if (element['defaultSnapId']) {
                            this.restApiService.getData('snap/' + element['defaultSnapId'], (snap_details_response) => {
                              if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                                user['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                              }
                            });
                          } else {
                            user['staticDpImg'] = false;
                          }
                          this.teacher_user_tagged_array.push(user);
                        }
                      }
                    });
                  }
                });

                // story['comment_display_count']= (story['comment_array'] ? (story['comment_array'].length>2 ? story['comment_array'].length - 2 : 0) : 0);
                this.story_array.push(story);
                var capacity = this.story_array[0].capacities[0];
                // console.log(((capacity.capacityRemains < capacity.maxPurchase ? capacity.capacityRemains : capacity.maxPurchase) > 10 ? 10 : (capacity.capacityRemains < capacity.maxPurchase ? capacity.capacityRemains : capacity.maxPurchase)) + 1)
                console.log("Break point last");
              }
            } else {
              console.log("Something went wrong 1");
              this.alertService.showNotification('Something went wrong 1', 'error');
              // this.helperService.goBack();
            }
          });
        } else {
          console.log("Something went wrong 2");
          this.alertService.showNotification('Something went wrong 2', 'error');
          // this.helperService.goBack();
        }
      });
    } else {
      console.log("Something went wrong 3");
      this.alertService.showNotification('Something went wrong 3', 'error');
      this.helperService.goBack();
    }
    console.log("Break point func 1 end");
  }

  checkIfCapacityAvailable(capacity, number) {
    if(this.checkIfSoldOut(capacity)) return false;
    
    if(capacity.capacityRemains>=number) return true
    else return false;
  }

  /* Date Pipe to change to specific format */
  transformDateViewFormat(date) {
    date = new Date(date);
    return this.datePipe.transform(date, "dd/MM/yyyy"); //whatever format you need. 
  }

  /* Date Pipe to change format */
  transformDateChange(date) {
    return this.datePipe.transform(date, "dd/MM/yyyy"); //whatever format you need. 
  }

  /* Date Picker Event */
  onChangeDatePickerStart(event: any, type) {
    if (event && type) {
      if (type == 'created') {
        this.user_story_created_date = event;
      } else if (type == 'expiry') {
        this.user_story_expiry_date = event;
      }
    }
  }

  /*
  * Function to edit story
  */
  editActivityPopup(story_details) {
    this.default_story_popup_details.length = 0;
    this.default_story_popup_details.push(story_details)
    $('#alert_edit_story_popup').modal('show');
  }
  
  submitDraftEvent(story_details){
    console.log(story_details);
    $('#alert_submit_story_popup').modal('show');
  }

  /*
    * Re directing to get Direction page
    */
  routeToGoogleMaps() {
    if (this.lat && this.lng) {
      window.open('https://www.google.com/maps/dir/?api=1&destination=' + this.lat + ',' + this.lng, "_blank");
    }
  }
  ticket_capacity_details_array = new Array();
  onChangeSelectTicketNumber(event, capacity_details, saveSelection = false) {
    console.log('this was passed into the onchangeSelectNumber');
    console.log(capacity_details);
    if(saveSelection){
      this.ticketGenerationService.saveTicketSelection({
        capacityId: capacity_details.id,
        selectedCount: parseInt(capacity_details.ticketSelectedCount)
      });
    }
    if (capacity_details && capacity_details.id) {
      var check_index_value = this.ticket_capacity_details_array.findIndex((check_id) => { return check_id.id == capacity_details.id; });
      if (check_index_value == -1) {
        // if(capacity_details.ticketSelectedCount == 0) return;
        this.ticket_capacity_details_array.push(capacity_details);
        
      } else {
        if(capacity_details.ticketSelectedCount == 0) {
          this.ticket_capacity_details_array.splice(check_index_value, 1);
        }
        if (typeof this.ticket_capacity_details_array[check_index_value] !== 'undefined') {
          this.ticket_capacity_details_array.splice(check_index_value, 1, capacity_details);
        }
      }
    }
    this.calculatePrice(event, capacity_details);
  }

  calculatePrice(selected_ticket_count, details) {  
    console.log('log form calculate price');
    console.log(details);
    if (details && details.id) {
      if (details.serviceCharge && (details.status == "PAID" || details.status == "DONATION")) {
        // if (details.serviceCharge && details.serviceCharge.name == 'Organizer Pay Both the Fees (3.99%+GST)') {
        //   var check_index_value = this.ticket_price_with_details_array.findIndex((check_id) => { return check_id.capacity_id === details.id; });
        //   var total_amount = parseFloat((parseFloat(details.ticketPrice) * parseInt(details.ticketSelectedCount)).toFixed(2));
        //   if (check_index_value == -1) {
        //     if (details.ticketSelectedCount == '0') return
        //     this.ticket_price_with_details_array.push({ capacity_id: details.id, total_amount: total_amount, gst: 0, service_tax: 0, payment_gateway_charges: 0, GST_on_service_and_payment_charges: 0, total_calculated_amount: total_amount, ticket_count: parseInt(details.ticketSelectedCount) })
        //   } else {
        //     console.log('found a match 1');
        //     if (details.ticketSelectedCount == '0') {
        //       console.log('found 0 tickets');
        //       this.ticket_price_with_details_array.splice(check_index_value, 1);
        //     }
        //     if (typeof this.ticket_price_with_details_array[check_index_value] !== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id) {
        //       this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
        //       this.ticket_price_with_details_array[check_index_value].gst = 0;
        //       this.ticket_price_with_details_array[check_index_value].service_tax = 0;
        //       this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = 0;
        //       this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = 0;
        //       this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_amount;
        //       this.ticket_price_with_details_array[check_index_value].ticket_count = parseInt(details.ticketSelectedCount);
        //     }
        //   }
        // } else if (details.serviceCharge && details.serviceCharge.name == 'Customer Pay Both the Fees (3.99% + GST)') {
        //   var check_index_value = this.ticket_price_with_details_array.findIndex((check_id) => { return check_id.capacity_id === details.id; });
        //   let total_amount = parseFloat((parseFloat(details.ticketPrice) * parseInt(details.ticketSelectedCount)).toFixed(2));
        //   let GST = details.status == "DONATION"? 0 : parseFloat(((18 / 100) * total_amount).toFixed(2));
        //   let service_tax = parseFloat(((2 / 100) * (total_amount + GST)).toFixed(2));
        //   let payment_gateway_charges = parseFloat(((1.99 / 100) * (total_amount + GST)).toFixed(2));
        //   let GST_on_service_and_payment_charges = parseFloat(((18 / 100) * (service_tax + payment_gateway_charges)).toFixed(2));
        //   let total_calculated_amount = parseFloat((total_amount + GST + service_tax + payment_gateway_charges + GST_on_service_and_payment_charges).toFixed(2));
        //   if (check_index_value == -1) {
        //     if (details.ticketSelectedCount == '0') return;
        //     this.ticket_price_with_details_array.push({ capacity_id: details.id, total_amount: total_amount, gst: GST, service_tax: service_tax, payment_gateway_charges: payment_gateway_charges, GST_on_service_and_payment_charges: GST_on_service_and_payment_charges, total_calculated_amount: total_calculated_amount, ticket_count: parseInt(details.ticketSelectedCount) })
        //   } else {
        //     console.log('found a match 2');
        //     if (details.ticketSelectedCount == '0') {
        //       console.log('found 0 tickets');
        //       this.ticket_price_with_details_array.splice(check_index_value, 1);
        //     }
        //     if (typeof this.ticket_price_with_details_array[check_index_value] !== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id) {
        //       this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
        //       this.ticket_price_with_details_array[check_index_value].gst = GST;
        //       this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_calculated_amount;
        //       this.ticket_price_with_details_array[check_index_value].service_tax = service_tax;
        //       this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = payment_gateway_charges;
        //       this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = GST_on_service_and_payment_charges;
        //       this.ticket_price_with_details_array[check_index_value].ticket_count = parseInt(details.ticketSelectedCount);
        //     }
        //   }
        // } else if (details.serviceCharge && details.serviceCharge.name == "Pass Payment Gateway Fee to Customer (1.99% + GST)") {
        //   var check_index_value = this.ticket_price_with_details_array.findIndex((check_id) => { return check_id.capacity_id === details.id; });
        //   let total_amount = parseFloat((parseFloat(details.ticketPrice) * parseInt(details.ticketSelectedCount)).toFixed(2));
        //   let GST = details.status == "DONATION"? 0 : parseFloat(((18 / 100) * total_amount).toFixed(2));
        //   let payment_gateway_charges = parseFloat(((1.99 / 100) * (total_amount + GST)).toFixed(2));
        //   let GST_on_service_and_payment_charges = parseFloat(((18 / 100) * (payment_gateway_charges)).toFixed(2));
        //   let total_calculated_amount = parseFloat((total_amount + GST + payment_gateway_charges + GST_on_service_and_payment_charges).toFixed(2));
        //   if (check_index_value == -1) {
        //     if (details.ticketSelectedCount == '0') return;
        //     this.ticket_price_with_details_array.push({ capacity_id: details.id, total_amount: total_amount, gst: GST, service_tax: 0, payment_gateway_charges: payment_gateway_charges, GST_on_service_and_payment_charges: GST_on_service_and_payment_charges, total_calculated_amount: total_calculated_amount, ticket_count: parseInt(details.ticketSelectedCount) })
        //   } else {
        //     console.log('found a match 3');
        //     if (details.ticketSelectedCount == '0') {
        //       console.log('found 0 tickets');
        //       console.log(check_index_value);
        //       this.ticket_price_with_details_array.splice(check_index_value, 1);
        //     }
        //     if (typeof this.ticket_price_with_details_array[check_index_value] !== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id) {
        //       this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
        //       this.ticket_price_with_details_array[check_index_value].gst = GST;
        //       this.ticket_price_with_details_array[check_index_value].service_tax = 0;
        //       this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = payment_gateway_charges;
        //       this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = GST_on_service_and_payment_charges;
        //       this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_calculated_amount;
        //       this.ticket_price_with_details_array[check_index_value].ticket_count = parseInt(details.ticketSelectedCount);
        //     }
        //   }
        // } else if (details.serviceCharge && details.serviceCharge.name == "Pass Service Charge to Customer (2% + GST)") {
        //   var check_index_value = this.ticket_price_with_details_array.findIndex((check_id) => { return check_id.capacity_id === details.id; });
        //   let total_amount = parseFloat((parseFloat(details.ticketPrice) * parseInt(details.ticketSelectedCount)).toFixed(2));
        //   let GST = details.status == "DONATION"? 0 : parseFloat(((18 / 100) * total_amount).toFixed(2));
        //   let service_tax = parseFloat(((2 / 100) * (total_amount + GST)).toFixed(2));
        //   let GST_on_service_and_payment_charges = parseFloat(((18 / 100) * (service_tax)).toFixed(2));
        //   let total_calculated_amount = parseFloat((total_amount + GST + service_tax + GST_on_service_and_payment_charges).toFixed(2));
        //   if (check_index_value == -1) {
        //     if (details.ticketSelectedCount == '0') return;
        //     this.ticket_price_with_details_array.push({ capacity_id: details.id, total_amount: total_amount, gst: GST, service_tax: service_tax, payment_gateway_charges: 0, GST_on_service_and_payment_charges: GST_on_service_and_payment_charges, total_calculated_amount: total_calculated_amount, ticket_count: details.ticketSelectedCount })
        //   } else {
        //     console.log('found a match 4');
        //     if (details.ticketSelectedCount == '0') {
        //       console.log('found 0 tickets');
        //       this.ticket_price_with_details_array.splice(check_index_value, 1);
        //     }
        //     if (typeof this.ticket_price_with_details_array[check_index_value] !== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id) {
        //       this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
        //       this.ticket_price_with_details_array[check_index_value].gst = GST;
        //       this.ticket_price_with_details_array[check_index_value].service_tax = service_tax;
        //       this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = 0;
        //       this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = GST_on_service_and_payment_charges;
        //       this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_calculated_amount;
        //       this.ticket_price_with_details_array[check_index_value].ticket_count = parseInt(details.ticketSelectedCount);
        //     }
        //   }
        // }

        var check_index_value = this.ticket_price_with_details_array.findIndex((check_id) => { return check_id.capacity_id === details.id; });

        let total_amount = parseFloat((parseFloat(details.ticketPrice) * parseInt(details.ticketSelectedCount)).toFixed(2));
        let GST = details.status == "DONATION"? 0 : parseFloat(((details.serviceCharge.gstPercentage / 100) * total_amount).toFixed(2));
        let service_tax = parseFloat(((details.serviceCharge.serviceChargePercentage / 100) * (total_amount + GST)).toFixed(2));
        let payment_gateway_charges = parseFloat(((details.serviceCharge.paymentGatewayPercentage / 100) * (total_amount + GST)).toFixed(2));
        let GST_on_service_and_payment_charges = parseFloat(((details.serviceCharge.gstPercentage / 100) * (service_tax) + (details.serviceCharge.gstPercentage / 100) * (payment_gateway_charges)).toFixed(2));
        let total_calculated_amount = parseFloat((total_amount + GST + service_tax+ payment_gateway_charges + GST_on_service_and_payment_charges).toFixed(2));
        if (check_index_value == -1) {
              if (details.ticketSelectedCount == '0') return;
              this.ticket_price_with_details_array.push({ capacity_id: details.id, total_amount: total_amount, gst: GST, service_tax: service_tax, payment_gateway_charges: payment_gateway_charges, GST_on_service_and_payment_charges: GST_on_service_and_payment_charges, total_calculated_amount: total_calculated_amount, ticket_count: parseInt(details.ticketSelectedCount) })
            } else {
              if (details.ticketSelectedCount == '0') {
                this.ticket_price_with_details_array.splice(check_index_value, 1);
              }
              if (typeof this.ticket_price_with_details_array[check_index_value] !== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id) {
                this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
                this.ticket_price_with_details_array[check_index_value].gst = GST;
                this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_calculated_amount;
                this.ticket_price_with_details_array[check_index_value].service_tax = service_tax;
                this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = payment_gateway_charges;
                this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = GST_on_service_and_payment_charges;
                this.ticket_price_with_details_array[check_index_value].ticket_count = parseInt(details.ticketSelectedCount);
              }
            }
      } else {
        //free ticket
        var check_index_value = this.ticket_price_with_details_array.findIndex((check_id) => { return check_id.capacity_id === details.id; });
        if (check_index_value == -1) {
          if (details.ticketSelectedCount == '0') return;
          this.ticket_price_with_details_array.push({ capacity_id: details.id, total_amount: 0, gst: 0, service_tax: 0, payment_gateway_charges: 0, GST_on_service_and_payment_charges: 0, total_calculated_amount: 0, ticket_count: parseInt(details.ticketSelectedCount) })
        } else {
          if (details.ticketSelectedCount == '0') {
            this.ticket_price_with_details_array.splice(check_index_value, 1);
          }
          if (typeof this.ticket_price_with_details_array[check_index_value] !== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id) {
            this.ticket_price_with_details_array[check_index_value].total_amount = 0;
            this.ticket_price_with_details_array[check_index_value].gst = 0;
            this.ticket_price_with_details_array[check_index_value].service_tax = 0;
            this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = 0;
            this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = 0;
            this.ticket_price_with_details_array[check_index_value].total_calculated_amount = 0;
            this.ticket_price_with_details_array[check_index_value].ticket_count = parseInt(details.ticketSelectedCount);
          }
        }
      }
      this.showTicketInformation(() => { });
    }
  }
  ticket_information_details = new Array();
  // ticket_information_details = new Array({'total_amount':0,'gst':0,'service_tax':0,'internet_handling_fee_total':0,'payment_gateway_charges':0,'GST_on_service_and_payment_charges':0,'total_calculated_amount':0});
  showTicketInformation(callback) {
    this.ticket_information_details = new Array({ 'total_amount': 0, 'gst': 0, 'service_tax': 0, 'internet_handling_fee_total': 0, 'payment_gateway_charges': 0, 'GST_on_service_and_payment_charges': 0, 'total_calculated_amount': 0, 'total_ticket_count': 0 });
    this.ticket_price_with_details_array.forEach((element, key) => {
      if (element && element.capacity_id) {
        this.ticket_information_details[0]['total_amount'] += parseFloat((element.total_amount).toFixed(2));
        this.ticket_information_details[0]['gst'] += parseFloat((element.gst).toFixed(2));
        this.ticket_information_details[0]['internet_handling_fee_total'] += parseFloat((element.service_tax).toFixed(2)) + parseFloat((element.payment_gateway_charges).toFixed(2)) + parseFloat((element.GST_on_service_and_payment_charges).toFixed(2));
        this.ticket_information_details[0]['service_tax'] += parseFloat((element.service_tax).toFixed(2));
        this.ticket_information_details[0]['payment_gateway_charges'] += parseFloat((element.payment_gateway_charges).toFixed(2));
        this.ticket_information_details[0]['GST_on_service_and_payment_charges'] += parseFloat((element.GST_on_service_and_payment_charges).toFixed(2));
        this.ticket_information_details[0]['total_calculated_amount'] += parseFloat((element.total_calculated_amount).toFixed(2));
        this.ticket_information_details[0]['total_ticket_count'] += element.ticket_count;


        this.ticket_information_details[0]['total_amount'] = parseFloat(this.ticket_information_details[0]['total_amount'].toFixed(2));
        this.ticket_information_details[0]['gst'] = parseFloat(this.ticket_information_details[0]['gst'].toFixed(2));
        this.ticket_information_details[0]['internet_handling_fee_total'] = parseFloat(this.ticket_information_details[0]['internet_handling_fee_total'].toFixed(2));
        this.ticket_information_details[0]['service_tax'] = parseFloat(this.ticket_information_details[0]['service_tax'].toFixed(2));
        this.ticket_information_details[0]['payment_gateway_charges'] = parseFloat(this.ticket_information_details[0]['payment_gateway_charges'].toFixed(2));
        this.ticket_information_details[0]['GST_on_service_and_payment_charges'] = parseFloat(this.ticket_information_details[0]['GST_on_service_and_payment_charges'].toFixed(2));
        this.ticket_information_details[0]['total_calculated_amount'] = parseFloat(this.ticket_information_details[0]['total_calculated_amount'].toFixed(2));
      }
    });
    console.log(this.ticket_information_details);
    return callback && callback(true);
  }
  bookTicketWithRequiredQuantity() {
    // console.log("userID: ",this.user_id);
    // console.log("bookedby: "+this.bookedBy);

    if (!this.bookedBy) {
      this.alertService.showNotification("Please enter booking email", "error");
      $('.booking-email').css({ 'border': '1px solid red' });
      $('.booking-email').focus();
      document.querySelector(".booking-email").scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
      return false;
    }
    if(!this.emailRegex.test(this.bookedBy)){
      this.alertService.showNotification("Please enter valid email", "error");
      $('.booking-email').css({ 'border': '1px solid red' });
      $('.booking-email').focus();
      document.querySelector(".booking-email").scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
      return false;
    }
    var obj = this;
    this.bookingInProgress = true;
    if (!this.user_id) {
      this.restApiService.getData('user/isSignedUpUser/' + this.bookedBy, (response) => {
        if (response.success) {
          // console.log("if");
          // $('#signin_popup').modal('show');
          // return obj.router.navigateByUrl('/login');
          return obj.router.navigate(['/login'], {
            queryParams: {
              'returnUrl': '/activity/preview/' + this.story_id,
              'message': 'Booking user is already exist. Please sign in to book tickets',
              'email': this.bookedBy
            }
          });
        } else {
          // console.log("Else");
          this.restApiService.postAPI('user/autoSignUpUser/' + this.bookedBy, null, (autoSignupResponse) => {
            console.log("email response:", autoSignupResponse);
            if (autoSignupResponse.id) {
              this.user_id = autoSignupResponse.id;
              if (autoSignupResponse.autoSignUp && !autoSignupResponse.emailVerified) {
                console.log("login");
                console.log(obj.bookTicketWithRequiredQuantityAction);
                obj.authenticateService.loginAutoSignedUpUserOauth({ username: autoSignupResponse.email, password: '' }, '/activity/preview/' + this.story_id, obj.bookTicketWithRequiredQuantityAction, obj);
                // this.bookTicketWithRequiredQuantityAction();
              }
            }
          }, (error) => {this.alertService.showNotification('There was some problem while processing your order. Please try again'); this.bookingInProgress = false; });
        }
      },(error)=>{
        this.alertService.showNotification('There was some problem while processing your order. Please try again');
        this.bookingInProgress = false;
      });
    } else {
      this.bookTicketWithRequiredQuantityAction(this);
    }
  }
  bookTicketWithRequiredQuantityAction(obj) {
    console.log("bookedby: " + obj.bookedBy);
    if (obj.ticket_capacity_details_array && Array.isArray(obj.ticket_capacity_details_array) && obj.ticket_capacity_details_array.length > 0) {
      let event_booking_details = [];
      obj.ticket_capacity_details_array.forEach(element => {
        if (element && element.id) {
          var check_index_value = event_booking_details.findIndex((check_id) => { return check_id.capacityId === element.id; });
          if (check_index_value == -1) {
            if (element.ticketSelectedCount)
              event_booking_details.push({ "capacityId": element.id, "reqCapacity": element.ticketSelectedCount, "curCapacity": 0 });
          } else {
            if (typeof event_booking_details[check_index_value] !== 'undefined' && event_booking_details[check_index_value].capacityId == element.id) {
              if (element.ticketSelectedCount) {
                event_booking_details[check_index_value].reqCapacity = element.ticketSelectedCount;
              } else {
                event_booking_details.splice(check_index_value, 1);
              }
            }
          }
        }
      });
      let total_amount = 0;
      obj.showTicketInformation((response) => {
        if (response) {
          if (obj.ticket_information_details && Array.isArray(obj.ticket_information_details) && obj.ticket_information_details.length > 0) {
            obj.ticket_information_details.forEach((element, key) => {
              if (element && element.total_calculated_amount) {
                total_amount = element.total_calculated_amount;
              }
            });
            if (event_booking_details && Array.isArray(event_booking_details) && event_booking_details.length > 0) {
              var book_ticket_details = {
                "amount": (total_amount * 100),
                "currency": "INR",
                "receipt": "Event" + obj.story_id,
                "paymentCapture": 1,
                "eventBookingDetail": event_booking_details,
                "message": "Event Ticket Booking",
                "bookedBy": obj.bookedBy,
                "storyId": obj.story_id
              }
              obj.restApiService.postAPI('order/bookOrder', book_ticket_details, (response) => {
                if (response && response.success && response.orderId) {
                  localStorage.removeItem('event_total_amount_details');
                  localStorage.setItem('event_total_amount_details', JSON.stringify(obj.ticket_information_details));
                  if (response.bookedBy && response.bookedByLoggedId) {
                    localStorage.setItem('bookedBy', response.bookedBy);
                    localStorage.setItem('bookedByLoggedId', response.bookedByLoggedId);
                  }
                  return obj.router.navigate(['event/payment-registration/' + response.orderId]);
                } else if (response && !response.success) {
                  this.bookingInProgress = false;
                  obj.alertService.showNotification('Something went wrong', 'error');
                }
              });
            }
          }
        }
      });
    }
  }
  /*
  * route to story edit page
  */
  editStory() {
    if (this.default_story_popup_details && Array.isArray(this.default_story_popup_details) && this.default_story_popup_details.length == 1) {
      this.default_story_popup_details.forEach(story_element => {
        if (story_element.story_id && story_element.school_id && story_element.story_type && story_element.user_story_created_date) {
          $('#alert_edit_story_popup').modal('hide');
          if (story_element.story_type != 'CONVERSATION') {
            this.createStoryPopup((popup_response) => {
              if (popup_response) {
                this.storySelectSchool(story_element.school_id, (response) => {
                  if (response) {
                    this.storySelectStoryType(story_element.story_type, (select_story_response) => {
                      if (select_story_response) {
                        if (story_element.user_story_created_date) {
                          this.user_story_created_date = this.transformDateViewFormat(story_element.user_story_created_date);
                        }
                        if (story_element.story_type == 'ADVERTISEMENT' && story_element.user_story_expiry_date) {
                          this.user_story_expiry_date = this.transformDateViewFormat(story_element.user_story_expiry_date);
                        }
                        this.disable_select_school = true;
                      }
                    });
                  }
                });
              }
            });
          } else {
            this.alertService.showNotification('Conversation story can\'t be edited');
          }
        } else {
          this.alertService.showNotification('Something went wrong');
        }
      });

    }
  }

  /*
  * Function to show delete story popup
  */
  deleteActivityPopup({ story_id, story_text }) {
    this.default_story_popup_details.length = 0;
    if (story_id) {
      this.default_story_popup_details.push({ story_id: story_id, story_text: story_text })
      $('#alert_delete_story_popup').modal('show');
    }
  }

  //TODO2 delete
  // fun() {
  //   console.log(this.meta.getTag('property="og:url"'));
  // }

  /*
  * Function to delete story
  */
  deleteStory() {
    if (this.default_story_popup_details && Array.isArray(this.default_story_popup_details) && this.default_story_popup_details.length == 1) {
      this.default_story_popup_details.forEach(story_element => {
        if (story_element.story_id && parseInt(story_element.story_id) && story_element.story_text) {
          $('#alert_delete_story_popup').modal('hide');
          this.restApiService.postAPI('story/' + parseInt(story_element.story_id) +"/state/delete",0, (response) => {
            this.alertService.showAlertBottomNotification('Event deleted');
            setTimeout(() => { this.helperService.goBack(); }, 500);
            // this.getImagesRelativePath(story_element.story_text, (relative_path_response) => {
            //   if (relative_path_response && Array.isArray(relative_path_response) && relative_path_response.length > 0) {
            //     relative_path_response.forEach(element => {
            //       if (element.relative_path) {
            //         this.awsImageuploadService.deleteFile(element.relative_path, () => { });
            //       }
            //     });
            //   }
            // });
          });
        }
      });
    }
  }

  getImagesRelativePath(story_text, callback) {
    let image_relative_path = [];
    this.story_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story_text);
    var container = this.story_content.nativeElement.querySelectorAll('div');
    var container_main_array = Array.prototype.slice.call(container);
    container_main_array.forEach(main_element => {
      var container_child_array = Array.prototype.slice.call(main_element.children);
      container_child_array.every(child_element => {
        if (child_element.tagName == "IMG") {
          if (child_element.dataset.src) {
            image_relative_path.push({ relative_path: child_element.dataset.src });
          }
        } else if (child_element.tagName == "VIDEO") {
          if (child_element.dataset.src) {
            image_relative_path.push({ relative_path: child_element.dataset.src });
          }
        } else if (child_element.tagName == "EMBED") {
          if (child_element.dataset.src) {
            image_relative_path.push({ relative_path: child_element.dataset.src });
          }
        }
      });
    });
    return callback && callback(image_relative_path);
  }

  /*
  * Function to close preview
  */
  closeActivityPreview() {
    return this.helperService.goBack();
    // return this.router.navigate(['/']);
  }

  /*
  * create story function to parent, teacher and admin
  */
  createStoryPopup(callback) {
    localStorage.removeItem('story_creation_type_details');
    this.story_school_array.length = 0;
    this.story_type_admin_parent_status = false;
    this.story_date_status = false;
    this.story_expiry_date_status = false;

    this.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response) => {
      if (response && response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
        response['schoolDetail'].forEach(element => {
          if (element.school.id && element.school.name && element.role) {
            var check_id = this.story_school_array.filter((details) => { return details.id === element.school.id });
            if (check_id.length == 0) {
              let staticSchoolDpImg = '';
              if (element['defaultSnapId']) {
                this.restApiService.getData('snap/' + element['defaultSnapId'], (snap_details_response) => {
                  if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                    staticSchoolDpImg = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                  }
                });
              }
              this.story_school_array.push({ id: element.school.id, name: element.school.name, role: element.role, staticSchoolDpImg: staticSchoolDpImg, isChecked: false })
            }
          }
        });
        // $('#create_story_popup').modal('show');
        return callback && callback(true);
      }
    });
  }

  /*
  * Function to select the school
  * while creating the story
  */
  private storySelectSchool(school_id, callback) {
    this.story_type_admin_parent_status = false;
    this.story_date_status = false;
    this.story_expiry_date_status = false;

    this.story_school_array.forEach(element => {
      if (element.id !== school_id) {
        element.isChecked = false;
      }
    });

    var check_id = this.story_school_array.filter((details) => { return details.id === parseInt(school_id) && details.isChecked === true });
    if (check_id.length == 0) {
      var index_value = this.story_school_array.findIndex(obj => obj.id == parseInt(school_id));
      if (index_value > -1) {
        if (typeof this.story_school_array[index_value] !== 'undefined') {
          this.story_school_array[index_value]['isChecked'] = true;
        }
      }
    } else {
      var index_value = this.story_school_array.findIndex(obj => obj.id == parseInt(school_id));
      if (index_value > -1) {
        if (typeof this.story_school_array[index_value] !== 'undefined') {
          this.story_school_array[index_value]['isChecked'] = false;
        }
      }
    }
    this.story_type_array.forEach(element => {
      element.isChecked = false;
    });

    var check_id_selected = this.story_school_array.filter((details) => { return details.id === parseInt(school_id) && details.isChecked === true });
    if (check_id_selected.length > 0) {
      if (check_id_selected && Array.isArray(check_id_selected)) {
        check_id_selected.forEach(element => {
          if (element && element.role && Array.isArray(element.role) && element.role.length > 0) {
            var index_value = element.role.findIndex(obj => obj == 'ADMIN' || obj == 'TEACHER');
            if (index_value > -1) {
              this.story_type_admin_parent_status = true;
            }
            if (!this.story_type_admin_parent_status) {
              var parent_check_index_value = element.role.findIndex(obj => obj == 'PARENT');
              if (parent_check_index_value > -1) {
                this.story_created_by_role = 'PARENT';
                this.story_date_status = true;
                this.story_type_array.forEach(element => {
                  if (element.type == 'STORY') {
                    element.isChecked = true;
                  }
                })
              }
            }
            var admin_check_index_value = element.role.findIndex(obj => obj == 'ADMIN');
            if (admin_check_index_value > -1) {
              this.story_created_by_role = 'ADMIN';
            }

            if (this.story_created_by_role != 'ADMIN' && this.story_created_by_role != 'PARENT') {
              var teacher_check_index_value = element.role.findIndex(obj => obj == 'TEACHER');
              if (teacher_check_index_value > -1) {
                this.story_created_by_role = 'TEACHER';
              }
            }

          }
        });
      }
    }
    return callback && callback(true);
  }

  /*
  * Function to select the story type
  * while creating the story
  */
  storySelectStoryType(type, callback) {
    this.story_date_status = false;
    this.story_expiry_date_status = false;

    this.story_type_array.forEach(element => {
      if (element.type !== type) {
        element.isChecked = false;
      }
    });

    var check_id = this.story_type_array.filter((details) => { return details.type === type && details.isChecked === true });
    if (check_id.length == 0) {
      var index_value = this.story_type_array.findIndex(obj => obj.type == type);
      if (index_value > -1) {
        if (typeof this.story_type_array[index_value] !== 'undefined') {
          this.story_type_array[index_value]['isChecked'] = true;
        }
      }
    } else {
      var index_value = this.story_type_array.findIndex(obj => obj.type == type);
      if (index_value > -1) {
        if (typeof this.story_type_array[index_value] !== 'undefined') {
          this.story_type_array[index_value]['isChecked'] = true;
        }
      }
    }

    var check_id_selected = this.story_type_array.filter((details) => { return details.type === type && details.isChecked === true });
    if (check_id_selected.length > 0) {
      if (check_id_selected && Array.isArray(check_id_selected)) {
        this.story_date_status = true;
        this.user_story_created_date = new Date();
      }
    }

    if (type == 'ADVERTISEMENT') {
      this.story_expiry_date_status = true;
      this.user_story_expiry_date = new Date();
    }
    return callback && callback(true);
  }

  /*
  * Function to save all story details
  */
  saveStoryPopupDetails() {
    this.editStory();
    this.story_creation_popup_error = false;
    this.story_school_error_status = false;
    this.story_type_error_status = false;
    this.story_created_date_error_status = false;
    this.story_expiry_date_error_status = false;
    var school_id = 0, story_type = '';

    if (this.story_school_array && Array.isArray(this.story_school_array) && this.story_school_array.length > 0) {
      this.story_school_array.forEach(element => {
        if (element && element.isChecked) {
          school_id = element.id;
        }
      });
    }
    // admin edit story 
    if (!school_id) {
      if(this.authenticateService.isSuperAdmin){
        school_id = this.school_id;
      }else{
        this.story_school_error_status = true;
        return false;
      }
    }

    if (this.story_type_array && Array.isArray(this.story_type_array) && this.story_type_array.length > 0) {
      this.story_type_array.forEach(element => {
        if (element && element.isChecked) {
          story_type = element.type;
        }
      });
    }
    if (!story_type) {
      this.story_type_error_status = true;
      return false;
    }
    if (!this.user_story_created_date) {
      this.story_created_date_error_status = true;
      return false;
    }
    if (story_type && story_type == 'ADVERTISEMENT' && !this.user_story_expiry_date) {
      this.story_expiry_date_error_status = true;
      return false;
    }
    // console.log(this.story_created_by_role); admin role create or edit story
    if(this.authenticateService.isSuperAdmin){
      this.story_created_by_role = "ADMIN";
    }
    if (school_id && story_type && this.user_story_created_date && this.story_created_by_role && this.story_id) {
      if (story_type == 'ADVERTISEMENT' && !this.user_story_expiry_date) {
        this.story_creation_popup_error = true;
        return false;
      }
      var story_creation_type_details = { 'school_id': school_id, 'story_type': story_type, 'story_created_date': this.user_story_created_date, 'story_created_by_role': this.story_created_by_role, 'story_expiry_date': this.user_story_expiry_date };
      localStorage.setItem('story_creation_type_details', JSON.stringify(story_creation_type_details));
      localStorage.setItem('story_details', JSON.stringify({ 'story_id': this.story_id }));
      $('#create_story_popup').modal('hide');
      return this.router.navigateByUrl('/story/edit/' + this.story_id);
    } else {
      this.story_creation_popup_error = true;
      return false;
    }
  }

  submitEvent(){
    $('#alert_submit_story_popup').modal('hide');
    this.restApiService.postAPI(`story/${this.story_id}/state/submit`, {}, (response)=>{
      if(response && response.success){
        this.alertService.showAlertBottomNotification('Event activity submitted, waiting for admin to approve');
        this.router.navigateByUrl('/stories/pending');
      }
      else this.alertService.showNotification('There was a problem submitting the story, please try again later', 'error');
    })
  }

  /*
  * Function to publish story
  */
  updateStory() {
    if (this.story_id) {
      this.restApiService.postAPI(`story/${this.story_id}/state/publish`, {}, (response) => {
        if (response) {
          if (response['success']) {
            this.alertService.showAlertBottomNotification('story published');
            this.helperService.goBack();
          } else if (!response['success']) {
            if (response['message']) {
              this.alertService.showNotification(response['message'], 'error');
            }
          }
        } else {
          this.alertService.showNotification('something went wrong', 'error');
        }
      });
    } else {
      this.alertService.showNotification('something went wrong', 'error');
      this.helperService.goBack();
    }
  }

  // Comment Part

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
      this.restApiService.getData('user/' + this.user_id, (user_response) => {
        if (user_response && user_response.id && user_response.userProfile) {
          try {
            var user = [];
            user['id'] = user_response.id;
            if (user_response.userProfile['defaultSnapId']) {
              this.restApiService.getData('snap/' + user_response.userProfile['defaultSnapId'], (snap_details_response) => {
                if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                  user['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                }
              });
            } else {
              user['staticDpImg'] = false;
            }
            user['isChecked'] = true;
            user['user_type'] = 'parent';
            user['firstName'] = user_response.userProfile.firstName;
            user['lastName'] = user_response.userProfile.lastName;
            var check_id = this.user_child_detail_array.filter((details) => { return details.id === user_response.id && details.user_type == 'parent' });
            if (check_id.length == 0)
              this.user_child_detail_array.push(user);
          } catch (e) { }
          // console.log("Exception:",e);
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
      this.alertService.showNotification("Something went wrong, Please try again", 'error');
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
          arrayExtensions = ["mp3", "wav"];
          ext_type1 = 'audio/mp3';
          ext_type2 = 'audio/wav';
          ext_type3 = 'audio/mpeg';
        } else {
          this.alertService.showNotification('Something went wrong, Please try again', 'error');
          $("#main_file").val('');
          return false;
        }
        if (file_data.type == ext_type1 || file_data.type == ext_type2 || file_data.type == ext_type3) {
          if (file_data.size < 5120000) {
            return true;
          } else {
            this.alertService.showNotification('Size should be less than 5MB.', 'error');
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
  * Function to save snap (image,audio)
  */
  saveToDb(file_data, type_sent, story_id, comment_type, comment_id) {
    if (this.user_id && story_id && this.selected_school_id) {
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
        } else {
          this.alertService.showNotification('Something went wrong, Please try again', 'error');
          return false;
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
      var check_id_array = this.story_array.filter((stories) => { return stories.id == story_id });
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
  postComment(id) {
    document.getElementById('comment_text_' + id + '_error') ? document.getElementById('comment_text_' + id + '_error').innerHTML = '' : '';
    var template = '', post_comment = '';
    if (this.comment_multiple_file_array && this.comment_multiple_file_array.length > 0) {
      this.comment_multiple_file_array.forEach(element => {
        if (element && element.story_id == parseInt(id) && element.comment_type == 'parent') {
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
      var comment_details = {
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
      this.restApiService.putAPI('comment/update', comment_details, (comment_response) => {
        console.log(comment_response);
        if (comment_response && comment_response['id'] && comment_response.comment) {
          (<HTMLInputElement>document.getElementById('comment_text_' + id)).value = '';
          this.comment_multiple_file_array.length = 0;
          // this.alertService.showNotification('Done');
          var check_id = this.story_array.filter((stories) => { return stories.id == id });
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
                if (element.comment_array) {
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
        } else if (comment_response && !comment_response['success'] && comment_response['message']) {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        }
        this.restApiService.postAPI('comment/setPublic/' + comment_response['id'] + (this.marked? '/0' : '/1'), {}, ()=>{
          this.story_array[0].comment_array[this.story_array[0].comment_array.length - 1].result.public = this.marked ? false: true;
        });
      });
    }
  }

  /*
  * Function to post comment
  */
  postChildComment(story_id, comment_id) {
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
      var comment_details = {
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
      this.restApiService.putAPI('comment/update', comment_details, (comment_response) => {
        console.log(comment_response);
        if (comment_response && comment_response['id'] && comment_response.comment) {
          if (document.getElementById('child_comment_text_' + comment_id))
            (<HTMLInputElement>document.getElementById('child_comment_text_' + comment_id)).value = '';

          this.closeChildReplyCommentBox(story_id, comment_id, '');
          this.comment_multiple_file_array.length = 0;
          var check_id_array = this.story_array.filter((stories) => { return stories.id == story_id });
          if (check_id_array.length > 0) {
            if (comment_response.comment && comment_response.user && comment_response.user.id && comment_response.user.userProfile) {
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
                      if (check_array.length == 0)
                        child_element.child_comment_array.push({ id: comment_response.id, result: comment_response, comment_details: comment_details });
                    }
                  });
                }
              });
            }
          }
        } else if (!comment_response['success'] && comment_response['message']) {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        } else {
          this.alertService.showNotification('Something went wrong, please try again', 'error');
        }
        this.restApiService.postAPI('comment/setPublic/' + comment_response['id'] + (this.marked? '/0' : '/1'), {}, ()=>{
          this.story_array[0].comment_array[this.story_array[0].comment_array.length - 1].result.public = this.marked ? false: true;
        });
      });
    }
  }

  /* 
  * Function to show or hide comments
  */
  showHideComment(action_type, story_id, comment_type, comment_id) {
    if (story_id && comment_type && action_type) {
      var check_id = this.story_array.filter((stories) => { return stories.id == story_id });
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
              var check_id = this.story_array.filter((stories) => { return stories.id == delete_element.story_id });
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
              var check_id = this.story_array.filter((stories) => { return stories.id == delete_element.story_id });
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
      var check_id_array = this.story_array.filter((stories) => { return stories.id == story_id });
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
      var check_id_array = this.story_array.filter((stories) => { return stories.id == story_id });
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
  * Modal gallery popup
  */
  modal_images: Image[] = [];
  buttonsConfigSimple: ButtonsConfig = {
    visible: true,
    strategy: ButtonsStrategy.SIMPLE
  };
  openImageModal(image_array, image_src, action_type) {
    this.modal_images = [];
    if (image_array && Array.isArray(image_array) && image_array.length > 0 && image_src && action_type) {
      image_array.forEach(element => {
        if (element.type == 'image_file') {
          var check_id = this.modal_images.filter((details) => { return details.id == element.image_src });
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
  * Show emoji
  */
  showEmoji(story_id, type, comment_id) {
    if (story_id && parseInt(story_id) && type) {
      var check_id_array = this.story_array.filter((stories) => { return stories.id == story_id });
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

  /**
 * Check if a capacity is bookable
 *
 * @param {any} capacity - capacity object containing relavent fields - returned in API.
 * @returns {false|string} - false if capacity is bookable and string if not able to book. 
 */
  checkIfSoldOut(capacity: any) {
    var startDate = new Date(capacity.duration.bookingStart)
    var endDate = new Date(capacity.duration.bookingEnd);
    var today = new Date();
    if(today < startDate) return 'Bookings not yet open';
    if(parseInt(capacity.capacityRemains)<1) return 'Sold out';
    if(today > endDate) return 'Bookings closed';
    // then ticket is available for purchase
    return false;
  }
  /* 
    * Function to display storiesng build
    */
  showStories() {
    if (!this.school_id) {
      return;
    }
    // this.mutiple_stories_array=[];
    // this.alertService.showLoader();
    this.loadingStories = true;
    this.restApiService.getData(`story/query?status=PUBLISHED&isPublic=true&schoolId=${this.school_id}&page=${this.currentPage}&size=2`, (response) => {
      
      if (response.empty) this.hasMoreStories = false;
      if (response && response.content && Array.isArray(response.content) && response.content.length > 0) {
        if(response.content.length < this.pageSize) {this.hasMoreStories = false;}
        response.content.forEach(story => {
          var check_already_present_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story.id });
          if (check_already_present_array.length == 0) {
            if (story.caption != '' && story.caption) {
              this.story_header_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.caption);
              var container = this.story_header_content.nativeElement.querySelectorAll('p');
              var container_main_array = Array.prototype.slice.call(container);
              container_main_array.forEach(main_element => {
                if (main_element.textContent) {
                  story['caption_plain'] = main_element.textContent;
                }
              });
              story.caption = this.sanitizer.bypassSecurityTrustHtml(story.caption);
            }
            story['multiple_file_array'] = [];
            var image_array = [], video_array = [], pdf_array = [];
            // if(story.capacities && Array.isArray(story.capacities) && story.capacities.length>0){
            this.story_content_filter.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.text);
            var container = this.story_content_filter.nativeElement.querySelectorAll('div');
            var container_main_array = Array.prototype.slice.call(container);
            container_main_array.forEach(main_element => {
              var container_child_array = Array.prototype.slice.call(main_element.children);
              container_child_array.every(child_element => {
                if (child_element.tagName == "P") {
                  console.log(child_element.textContent);
                  if (main_element.innerHTML) {
                    var more_text = '';
                    if (main_element.innerHTML > 100) {
                      more_text = ". .";
                    }
                    main_element.innerHTML = main_element.innerHTML.substring(0, 100) + more_text;
                  }
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

            // }
            // console.log(stories.id);
            var check_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story.id });
            if (check_array.length == 0 && story.id != this.story_id)
              this.mutiple_stories_array.push(story);
              console.log(this.mutiple_stories_array)
          }
        });
      }
      this.alertService.hideLoader();
      this.loadingStories = false;
    });

  }

  loadMoreStories() {
    this.currentPage = this.currentPage + 1;
    this.showStories();
  }

  toggleVisibility(e){
    this.marked= e.target.checked;
  }

  resolveStoryId(str: string){
    for (var i = 0; i < str.length; i++) {
      if(isNaN(parseInt(str.charAt(i)))){
        return parseInt(atob(str));
      }
    }
      return parseInt(str);
  }
}
interface marker {
	lat: number;
	lng: number;
	label?: string;
  draggable: boolean;
}
