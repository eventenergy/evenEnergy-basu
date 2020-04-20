import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { HelperService } from '../../../_helpers';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../../_services';
import { AWS_DEFAULT_LINK } from '../../../config';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-school-activity',
  templateUrl: './school-activity.component.html',
  styleUrls: ['./school-activity.component.scss']
})
export class SchoolActivityComponent implements OnInit {
  private unsubscribe$ = new Subject();

  selected_school_id: number;
  user_id: number;
  mutiple_stories_array = new Array();
  @ViewChild('story_content') story_content: ElementRef;
  @ViewChild('story_header_content') story_header_content: ElementRef;
  refresh_token: number;
  currentPage: number = 0;
  isPrivate: boolean = false;

  @HostListener('window:scroll', ['$event'])
  onScroll(e) {
    $(window).on("scroll", function () {
      var scrollHeight = $(document).height();
      var scrollPosition = $(window).height() + $(window).scrollTop();
      if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
      }
    });
    if (((window.innerHeight + window.scrollY) >= document.body.offsetHeight) && this.hasStoriesToload && !this.isLoading) {
      this.showStories();
    }
  }
  storyChanged: boolean;
  story_limit: number = 6;
  story_offset: number = 0;
  hasStoriesToload: boolean = true;
  isLoading: boolean = false;
  constructor(
    private helperService: HelperService,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private router: Router,
    public route: ActivatedRoute,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private location: Location,
    private alertService: AlertService
  ) {
    this.dataService.getSchoolId.takeUntil(this.unsubscribe$).subscribe((id) => {
      this.selected_school_id = id;
      this.storyChanged = true;
    });
    this.user_id = this.dataService.hasUserId();
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if (!this.refresh_token && params['refresh']) {
        this.refresh_token = params['refresh'];
      }
      if (params['refresh'] && this.refresh_token && params['refresh'] > this.refresh_token) {
        this.refresh_token = params['refresh'];
        this.ngOnInit();
        this.ngAfterViewInit();
      }
      this.location.replaceState(this.location.path().split('?')[0], '');
    });
  }

  ngOnInit() {
    this.alertService.setTitle( 'Activity' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response) => {
      if (response) {
        if (response['user'] && response['user']['id']) {
          if (response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
            if (this.user_id && this.selected_school_id)
              obj.showStories();

          } else {
            return obj.router.navigateByUrl('/login');
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
  * Angular default life cycle method 
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }
  resetData(){
    this.currentPage = 0;
    this.mutiple_stories_array = [];
    this.showStories();
  }
  /* 
  * Function to display stories
  */
  showStories() {
    if (this.user_id && this.selected_school_id) {
      if (this.storyChanged) {
        this.mutiple_stories_array = []; 
        this.currentPage = 0;
        this.hasStoriesToload = true;
      }
      this.isLoading = true;
      this.alertService.showLoader();
      // this.restApiService.getData('story/school/'+this.selected_school_id+'/user/'+this.user_id,(response)=>{
      //   if(response && Array.isArray(response) && response.length>0){
      // response=response.sort(function(x, y){
      //   return y.updatedAt - x.updatedAt;
      // });
      // this.restApiService.getData(`story/user/${this.user_id}/state/PUBLISHED/offset/${this.story_offset}/limit/${this.story_limit}`,(response)=>{
      // response=response.slice(0,20);
      // response=response.filter((details)=>{ return details.status === "PUBLISHED"});                                                                                                                                                                                                                                                                                                                                                                                              
      this.restApiService.getData(`story/query?status=PUBLISHED&isPublic=${this.isPrivate? false : true}&schoolId=${this.selected_school_id}&sort=createdAt,desc&page=${this.currentPage}&size=6`, (response) => {
        if (response && response.content && Array.isArray(response.content) && response.content.length > 0) {
          this.currentPage = this.currentPage + 1;
          if(response.last == true) this.hasStoriesToload = false;
          response.content.forEach(story => {
            var check_already_present_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story.id });
            if (check_already_present_array.length == 0) {
              if (story.caption != '' && story.caption) {
                this.story_header_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.caption);
                var container = this.story_header_content.nativeElement.querySelectorAll('p');
                var container_main_array = Array.prototype.slice.call(container);
                container_main_array.forEach(main_element => {
                  if (main_element.textContent) {
                    story['caption_plain'] = main_element.textContent.substring(0,28) + (main_element.textContent.length>28 ?'...' : '');
                  }
                });
                story.caption = this.sanitizer.bypassSecurityTrustHtml(story.caption);
              }
              // static image end created by event start
              // this.restApiService.getData('user/'+story.userId,(user_detail_response)=>{
              //   if(user_detail_response && user_detail_response.id && user_detail_response.userProfile){
              //     try{
              //       if(user_detail_response.userProfile['defaultSnapId']){
              //         this.restApiService.getData('snap/'+user_detail_response.userProfile['defaultSnapId'],(snap_details_response)=>{
              //           if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
              //             story['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
              //           }
              //         });
              //       }else{
              //         story['staticDpImg']=false;
              //       }
              //       story['createrFirstName']=user_detail_response.userProfile.firstName;
              //       story['createrLastName']=user_detail_response.userProfile.lastName;
              //     }catch(e){}
              //   }
              // });
              // static image end created by event end

              // if(story.caption!='' && story.caption){
              //   var more_text='';
              //   if(story.caption.length>50){
              //     more_text=". .";
              //   }
              //   story.caption= story.caption.substring(0,50)+more_text;
              //   story.caption=this.sanitizer.bypassSecurityTrustHtml(story.caption);
              // }
              story['multiple_file_array'] = [];
              var image_array = [], video_array = [], pdf_array = [];
              this.story_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.text);
              var container = this.story_content.nativeElement.querySelectorAll('div');
              var container_main_array = Array.prototype.slice.call(container);
              container_main_array.forEach(main_element => {
                var container_child_array = Array.prototype.slice.call(main_element.children);
                container_child_array.every(child_element => {
                  if (child_element.tagName == "P") {
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
              var check_array = this.mutiple_stories_array.filter((stories) => { return stories.id == story.id });
              if (check_array.length == 0)
                this.mutiple_stories_array.push(story);

            }
          });
          this.isLoading = false;
        }
        else{
          this.hasStoriesToload = false;
        }
        this.alertService.hideLoader();
      });
      this.storyChanged = false;
    }
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
  updateDefaultImageUrl(event) {
    this.helperService.updateDefaultImageUrlHelper(event);
  }
  }
