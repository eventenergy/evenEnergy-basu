import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RestAPIService, AuthenticationService, DataService, AlertService } from "../../_services";
import { AWS_DEFAULT_LINK } from '../../config';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, interval } from 'rxjs';
import { start } from 'repl';
declare let jQuery: any;
declare let $: any;
import { Location, DatePipe } from '@angular/common';
import { NgxCarousel } from 'ngx-carousel';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  providers: [DatePipe]
})
export class HomePageComponent implements OnInit {
 
  private unsubscribe$ = new Subject();
  showIndicator = false;
  // user_id:number;
  story_limit: number = 30;
  story_offset: number = 0;
  currentPage: number = 0;
  pageSize: number = 6;
  hasMoreStories: boolean = true;
  mutiple_stories_array = new Array();
  @ViewChild('story_content') story_content: ElementRef;
  @ViewChild('story_header_content') story_header_content: ElementRef;
  logged_status: boolean = false;
  slides = new Array();
  eventQueryStart = new Date();
  eventQueryEnd = new Date();
  interval: NodeJS.Timer;
  filter: any;
  eventListHeading = 'Upcoming events';
  loadCarousel : boolean = true;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private restApiService: RestAPIService,
    // private dataService: DataService,
    private alertService: AlertService,
    private sanitizer: DomSanitizer,
    private authenticateService: AuthenticationService,
    private location: Location,
    private datePipe: DatePipe
  ) {
    window.scroll(0, 0);
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if (params['user'] && params['token']) {
        return this.router.navigate(['/user/forgot-password/reset'], { queryParams: { user: params['user'], token: params['token'] } })
      }
    });
    // this.logged_status = false;
    // this.user_id=this.dataService.hasUserId();
  }

  /* 
   *  Angular Default lifecycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Home' );//alert service for set title

    this.eventQueryEnd.setFullYear(this.eventQueryEnd.getFullYear() + 2);
    // console.log('this are the query time');

    var obj = this;
    obj.logged_status = false;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response) => {
      if (response) {
        if (response['user'] && response['user']['id']) {
          obj.logged_status = true;
        }
      } else {
        obj.logged_status = false;
      }
    });

    this.showStories();

    $(window).scroll(function () {
      if ($(this).scrollTop() > 10) {
        $('.sticky-navigation-top-bar').addClass("sticky");
      }
      else {
        $('.sticky-navigation-top-bar').removeClass("sticky");
      }
    });
    $(window).scroll(function () {
      var height = $(window).scrollTop();
      if (height > 60) {
        $('#back2Top').fadeIn();
      } else {
        $('#back2Top').fadeOut();
      }
    });
    $(document).ready(function () {
      $("#back2Top").click(function (event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, "4000");
        return false;
      });
    });
    $(window).on('scroll', function () {
      if ($(window).scrollTop()) {
        $('nav').addClass('black');
      } else {
        $('nav').removeClass('black');
      }
    });

    this.interval = setInterval(() => {
      this.calculateCountdown();
    }, 1000);
  }

  

  openFilterDropdown(){
    document.getElementById("filter-stories").style.height = "100%";
  }
  closeFilterDropdown(){
    document.getElementById("filter-stories").style.height = "0%";
  }
  /* 
  * Default Angular life cycle method 
  */
  ngAfterViewInit() {
    (function ($) {
      "use strict";
      // manual carousel controls
      $('.next').click(function () { $('.carousel').carousel('next'); return false; });
      $('.prev').click(function () { $('.carousel').carousel('prev'); return false; });
    })(jQuery);
  }


  switchIndicator(): void {
    this.showIndicator = !this.showIndicator;
  }

  /*
  * default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    clearInterval(this.interval);
  }

  commentSlider = [
    'One of the best decisions I have made in my life was to attend this conference. I got to interact with some of the best minds in the industry and gained valuable insights. I was also able to pitch my business to VC’s and we got our seed funding from here. The rest is history.',
    'Inking & Doodle Workshop by The Dram-Art-ic Life i', 
    'One of the best decisions I have made in my life was to attend this conference.', 
    'One of the best decisions I have made in my life was to attend this conference. I got to interact with some of the best minds in the industry and gained valuable insights. I was also able to pitch my business to VC’s and we got our seed funding from here. The rest is history.', 
    'One of the best decisions I have made in my life was to attend this conference.'
  ];

  /* 
 * Function to display stories
 */
  showStories() {
    // this.mutiple_stories_array=[];
    this.alertService.showLoader();
    // this.restApiService.getData(`state/PUBLISHED/offset/${this.story_offset}/limit/${this.story_limit}`,(response)=>{
    this.restApiService.getData(this.constructStoryQuery(), (response) => {
      console.log(response);
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
                  story['caption_plain'] = main_element.textContent.substring(0,28) + (main_element.textContent.length>28 ? '...' : '');
                }
              });
              story.caption = this.sanitizer.bypassSecurityTrustHtml(story.caption);
            }
            story['multiple_file_array'] = [];
            var image_array = [], video_array = [], pdf_array = [];
            let image_number_first = 1;
            // if(story.capacities && Array.isArray(story.capacities) && story.capacities.length>0){
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
                    if (image_number_first == 1 && this.currentPage == 0 && this.loadCarousel) {
                      //countdownLogic
                      this.slides.push({
                        image: AWS_DEFAULT_LINK + child_element.dataset.src,
                        title: story['caption_plain'],
                        description: '',
                        time: new Date(story.duration[0].utcStart),
                        countDown: { day: 0, hours: 0, min: 0, sec: 0 },
                        started: false,
                        id: story.id
                      })
                      this.calculateCountdown();
                      image_number_first++;
                    }
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
      }
      this.alertService.hideLoader();
      this.loadCarousel = false;
    },
    (failed)=>{
      this.alertService.hideLoader();
    });

  }

  calculateCountdown() {
    this.slides.forEach((slide) => {
      var today = new Date();
      var distance = slide.time.getTime() - today.getTime();
      if (distance < 0) {
        distance = distance * -1;
        slide.started = true;
      }
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      slide.countDown.day = days;
      slide.countDown.hours = hours;
      slide.countDown.min = minutes;
      slide.countDown.sec = seconds;
    })
  }

  loadMoreStories() {
    this.currentPage = this.currentPage + 1;
    this.showStories();
  }
  pophoverfunction() {
    $('#search_popup').hide();
  }
  opensearchpopup() {
    $('#search_popup').show();
  }
  closeDropdown() {
    $('#dropdown_content').hide();
  }

  slideConfig = {
    "slidesToShow": 1, 
    "slidesToScroll": 1,
    "touch": true,
    "loop": true,
    "dots":false,
    "arrows": false,
    // "centerMode": true,
    "autoplay": true,
    "speed": 2000,
    // "easing":"linear",
    // "interval": 4000,
    // "width":80,
    // variableWidth: true,
    // variableHeight: true,
    // "responsive": [
    //   {
    //     "breakpoint": 1024,
    //     "settings": {
    //       "slidesToShow": 1,
    //       "slidesToScroll": 1,
    //       "infinite": true,
    //       "dots": true,
    //       "centerMode": true,
    //       "autoplay": true,
    //       "touch": true,
    //       "loop": true,
    //     },
    //   },
    //   {
    //     "breakpoint": 600,
    //     "settings": {
    //       "slidesToShow": 1,
    //       "slidesToScroll": 1,
    //       "centerMode": true,
    //       "autoplay": true,
    //       "touch": true,
    //       "loop": true,
    //     },
    //   },
    //   {
    //     "breakpoint": 480,
    //     "settings": {
    //       "slidesToShow": 1,
    //       "slidesToScroll": 1,
    //       "centerMode": true,
    //       "autoplay": true,
    //       "touch": true,
    //       "loop": true,
    //     },
    //   },
    // ]
  };
  
  
  navigateToSearch() {
    this.router.navigate([{ outlets: { search: 'search' } }]);
  }

  //based on (eventQueryStart, eventQueryEnd, filter object from the filter component),
  //construct a query string used to get stories 
  constructStoryQuery() {
    var timeStart = `&durations.utcEnd=${this.datePipe.transform(this.eventQueryStart, "yyyy-MM-dd HH:mm:ss")}`;
    var timeEnd = `&durations.utcEnd=${this.datePipe.transform(this.eventQueryEnd, "yyyy-MM-dd HH:mm:ss")}`;
    var filterSubQuery = '';
    if (this.filter) {
      var filterArray = Object.entries(this.filter);
      for (const [filterType, filterValue] of filterArray) {
        switch (filterType) {
          case 'location':
            filterSubQuery = filterSubQuery + '&veneues.city=' + filterValue;
            break;
          case 'category':
            filterSubQuery = filterSubQuery + '&category.name=' + filterValue;
            break;
          default:
            break;
        }
      }
    }
    return `story/query?status=PUBLISHED${timeStart}${timeEnd}${filterSubQuery}&isPublic=true&sort=durations.utcStart,asc&page=${this.currentPage}&size=6`
  }

  applyFilter(filterObj) {
    this.eventListHeading = this.constructListHeading(filterObj);
    this.filter = filterObj;
    this.mutiple_stories_array = [];
    this.currentPage = 0;
    this.showStories();
    this.hasMoreStories = true;
  }

  //provide heading for the list of events shown depending upon the filter object provided
  constructListHeading(filterObj) {
    if (!filterObj) return 'Upcoming Events'

    var listHeading = "Showing events ";
    if (filterObj.location) listHeading = listHeading + 'in ' + filterObj.location + ' ';
    if (filterObj.category) listHeading = listHeading + 'of ' + filterObj.category + ' category';
    return listHeading;
  }

}




