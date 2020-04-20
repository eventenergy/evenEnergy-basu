import { Component, OnInit, EventEmitter, Renderer2, Output, ElementRef, HostListener, ViewChild, ViewEncapsulation, NgZone, ViewChildren, QueryList } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AWS_DEFAULT_LINK } from '../../config';
import { RestAPIService, AuthenticationService, DataService, AlertService } from '../../_services';
import { HelperService } from '../../_helpers';
import { Subject, Observable } from 'rxjs';
import { WebcamImage } from 'ngx-webcam';
import { AwsImageUploadService } from 'src/app/_services/aws-image-upload.service';
import { AwsImageUploadProgressService } from 'src/app/_services/aws-image-upload-progress.service';
declare let $: any;
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormGroup, FormArray, FormControl, ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { maybeQueueResolutionOfComponentResources } from '@angular/core/src/metadata/resource_loading';

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.component.html',
  styleUrls: ['./create-story.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('addDescTrigger', [
      transition('void => *', [
        animate(1500, keyframes([
          style({ borderColor: 'rgb(255, 200, 200)' }),
          style({ borderColor: 'rgb(245, 245, 245)' }),
          style({ borderColor: 'rgb(255, 200, 200)' }),
          style({ borderColor: 'rgb(245, 245, 245)' })
        ]))
      ])
    ])
  ]
})

export class CreateStoryComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @Output() onEditorKeyup = new EventEmitter<any>();
  learning_tags_selected_status = false;
  story_id: number;
  tagged_learning_tags_array = new Array();
  multiple_file_array = new Array();
  current_file_upload: any;
  people_tagged_array = new Array();
  tagged_student_id_array = new Array();
  delete_index_value: any;
  learning_tags = new Array();
  learning_tags_search = new Array();
  selected_learning_tags = new Array();
  snap_type: any;

  @ViewChild('story_content') story_content: ElementRef;
  @ViewChild('completeForm') completeForm: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  // @ViewChild('subCategorydropdown', { read: BsDropdownDirective }) subcategoryDdRef: BsDropdownDirective;
  @ViewChild('story_title') storyTitleRef: ElementRef;
  @ViewChild('focusDiv') focusDiv: ElementRef;
  @ViewChild('categoryLoader') categoryLoader: ElementRef;
  @ViewChild('category') categoryRef: ElementRef;
  @ViewChild('venue') venueRef: ElementRef;
  @ViewChild('timing') timingRef: ElementRef;



  search_html_content = new Array();
  search_html_content_array = new Array();
  tagged_people_status = false;
  user_id: number;
  school_id: number;
  story_type: string;
  is_published: boolean = false;
  story_created_date: Date;
  story_expiry_date: Date;
  role_name: string;
  nav_links = new Array<{ text: string, additional_text: string, click: string, font_icon:string, click_params: string }>();
  listenFunc: Function;
  learning_tag_name: string = '';
  learning_tag_description: string = '';
  parent_children_array = new Array();
  school_children_array = new Array();
  school_teacher_array = new Array();
  school_people_type_array = new Array();
  selectedPeopleType: string = 'Select Performers';
  tagged_user_id_array = new Array();
  story_caption: string = '';
  allowNavigation: boolean = false;
  clickSub: any = null;

  click_element_type_array = new Array();
  default_story_popup_details = new Array();
  // latest snapshot
  public webcamImage: WebcamImage = null;
  showCameraStatus: boolean = false;

  //Canvas image Required elements
  angleInDegrees: number = 0;
  canvas_generated_image: HTMLImageElement;
  canvas_relative_path;
  canvas_width = 600;
  canvas_height = 400;
  ctx: CanvasRenderingContext2D;
  rotated_canvas_generated_image_status: boolean = false;
  rotated_canvas_generated_image_src: string;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = false;
  }

  edit_story_status: string;

  today_date: Date = new Date();

  // start date
  event_start_date: Date;
  //start time
  event_start_time: Date = this.event_start_date;

  // end date
  event_end_date: Date;

  // End time
  event_end_time: Date;

  //category selection vars
  categoriesApiData: Array<any> = new Array();
  //for category selection
  //storing categories from the array returned from the api
  categories: Array<any> = [];
  //to store subcategories extracted from the array returned from the api
  subCategories: Array<any> = [];
  //to store arrays filtered based on input in the subcategory field
  // filteredsubCategories: Array<string> = [];
  //store category selected by the user
  selectedCategory: string = null;
  //store subcategory selected by the user
  selectedSubCategory: string = null;
  selectedSubCategoryId: number = 0;
  //category icons container
  categoryIcons: Array<any> = [
    { category: "Entertainment", icon: 'fa fa-star-half-empty' },
    { category: "Professional", icon: 'fa fa-handshake-o' },
    { category: "Sports", icon: 'fa fa-soccer-ball-o' },
    { category: "Trade Shows", icon: 'fa fa-line-chart' },
    { category: "Training", icon: 'fa fa-university' },
    { category: "Campus", icon: 'fa fa-graduation-cap' },
    { category: "Spiritual & Welness", icon: 'fa fa-signing' },
    { category: "Activities", icon: 'fa fa-bicycle' },
    { category: "Press Release", icon: 'fa fa-newspaper-o' },
    { category: "Promotional Event", icon: 'fa fa-bullhorn' },
  ]

  currentCategoryIcon: string = '';

  public datepickerConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  text_description_status: boolean = false;

  // @HostListener('window:popstate', ['$event'])
  // unloadNotification1($event: any) {
  //   $event.returnValue = false;
  //   history.pushState(null, null, 'http://localhost:4200/story/create/new');
  //   window.addEventListener('popstate', function(event) {
  //     history.pushState(null, null, 'http://localhost:4200/story/create/new');
  //   });
  // }

  showElement(el) {
    //if element is already displayed hide it
    if (el.style.display == 'block') { el.style.display = 'none'; return; }
    setTimeout(() => {
      el.style.display = 'block';
    }, 50);
  }

  story_background_color: string = "#ffffff";
  default_text: any;
  default_text_content: FormControl
  relative_path_value: string;
  event_type = 'public';
  //story title and story title editor display
  storyTitle: string = '';
  showStoryTitleEditor: boolean = false;

  eventDescriptionArray: FormArray = new FormArray([]);


  addEventDescription(title = null, content = null, index = null) {
    let newFormGroup = new FormGroup({
      title: new FormControl(title, Validators.required),
      content: new FormControl(content, Validators.required)
    });
    this.eventDescriptionArray.push(newFormGroup);

    if (index != 'first') {
      this.multiple_file_array.splice(index, 0, { type: 'text_file', description: newFormGroup });
      return this.multiple_file_array[0].description;
    } else {
      this.multiple_file_array.splice(this.multiple_file_array.length, 0, { type: 'text_file', description: newFormGroup });
      return this.multiple_file_array[this.multiple_file_array.length];
    }

  }


  storyTitleEditorSettings: any = {
    base_url: '/tinymce',
    suffix: '.min',
    menubar: false,
    paste_as_text: true,
    mobile: {
      theme: 'silver'
    },
    plugins: 'wordcount paste',
    toolbar: "fontselect | forecolor | bold italic backcolor",
    content_css: 'https://fonts.googleapis.com/css?family=Source+Sans+Pro&display=swap',
    content_style: 'p { margin: 10px 0px; font-size: 36px; font-weight: 400; color: #656f73; line-height: normal; font-family: Source Sans Pro sans-serif}',
    forced_root_block: 'p',
    setup: function (editor) {
      editor.on('keydown', function (e) {
        if (e.keyCode == 13) {
          e.preventDefault();
        }
      });
    },
    init_instance_callback: function (editor) {
      editor.focus();
    }
  }

  handleEnterKey(event) {
    console.log(event.editor.getElement());
  }

  storySubTitleEditorSettings: any = {
    base_url: '/tinymce',
    suffix: '.min',
    menubar: false,
    mobile: {
      theme: 'silver'
    },
    statusbar: false,
    plugins: 'paste',
    paste_as_text: true,
    paste_data_images: false,
    paste_preprocess: function (plugin, args) {
      args.content = args.content.replace(/(\r\n|\n|\r)/gm, "");
    },
    toolbar: "fontselect | forecolor",
    content_css: 'https://fonts.googleapis.com/css?family=Source+Sans+Pro&display=swap',
    content_style: 'h3 { margin: 0px 10px; font-size: 24px; font-weight: 400; color: #656f73; line-height: normal; font-family: Source Sans Pro sans-serif}',
    forced_root_block: 'h3',
    setup: function (editor) {
      editor.on('keydown', function (e) {
        if (e.keyCode == 13) {
          e.preventDefault();
        }
      });
    },
    init_instance_callback: function (editor) {
      editor.focus();
    }
  }

  // 'advlist autolink lists link image charmap print preview anchor',
  //     'searchreplace visualblocks code fullscreen',
  //     'insertdatetime media table paste code help wordcount'


  storyContentEditorSettings: any = {
    base_url: '/tinymce',
    suffix: '.min',
    height: 500,
    statusbar: false,
    menubar: false,
    content_style: 'p, li { margin: 10px 0px; font-size: inherit; font-weight: 400; color: #656f73; line-height: normal; font-family: inherit;} * {font-weight: inherit; color: #656f73}',
    plugins: [
      'wordcount', 'lists'
    ],
    toolbar: 'insert | undo redo |  formatselect | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
    content_css: ['//fonts.googleapis.com/css?family=Lato:300,300i,400,400i'],
    init_instance_callback: function (editor) {
      editor.focus();
    }
  }

  // debug() {
  //   console.log(this.event_type);
  // }

  setEditorFocus() {
    this.renderer.addClass(this.focusDiv.nativeElement, "focus-div");
    setTimeout(() => {
      this.showStoryTitleEditor = true;
    }, 50);
  }



  tagged_people_class_status: boolean = false;
  aws_upload_progress_array = new Array();

  //ticket form variables
  ticketFormMain: FormGroup;
  ticketDisplay: Array<boolean> = [];
  eventVeneueId: number = 0;
  eventTimeSpanId: number = 0;
  defaultTickets: Array<{ index: number, formGroup: FormGroup }> = [];

  capacity_id_array = new Array();

  constructor(
    private elementRef: ElementRef,
    public sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    public datePipe: DatePipe,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private helperService: HelperService,
    private alertService: AlertService,
    private awsImageuploadService: AwsImageUploadService,
    private awsUploadProgressService: AwsImageUploadProgressService,
  ) {
    this.datepickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'DD/MM/YYYY',
        isAnimated: true,
      });
    $(document).click(function (e) {
      var container = $("#open_background_color_picker");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('#picker_background_color').hide();
      }
    });

    if (localStorage.getItem('story_creation_type_details')) {
      var story_creation_type_details = JSON.parse(localStorage.getItem('story_creation_type_details'));
      if (story_creation_type_details) {
        if (story_creation_type_details.school_id && story_creation_type_details.story_type && story_creation_type_details.story_created_date && story_creation_type_details.story_created_by_role) {
          if (story_creation_type_details.story_type == 'ADVERTISEMENT' && !story_creation_type_details.story_expiry_date) {
            console.log('break point 1');
            this.alertService.showNotification('Something went wrong, Please try again', 'error');
            this.helperService.goBack();
          }
          this.school_id = story_creation_type_details.school_id;
          this.story_type = story_creation_type_details.story_type;
          this.story_created_date = new Date(story_creation_type_details.story_created_date);
          this.role_name = story_creation_type_details.story_created_by_role;
          if (story_creation_type_details.story_type == 'ADVERTISEMENT' && story_creation_type_details.story_expiry_date) {
            this.story_expiry_date = story_creation_type_details.story_expiry_date;
          }
        } else {
          this.alertService.showNotification('Something went wrong, Please try again', 'error');
          console.log('break point 2');
          this.helperService.goBack();
        }
      }
    } else {
      this.alertService.showNotification('Something went wrong, Please try again', 'error');
      console.log('break point 3');
      this.helperService.goBack();
    }

    // if (this.dataService.hasUserId() && this.school_id) {
    //   this.user_id = this.dataService.hasUserId();
    //   if (!localStorage.getItem('story_details')) {
    //     this.getParentChildren('', [], (response) => {
    //       if (response) {
    //         this.getSchoolPeopleTypeDetails('', [], []);
    //         this.getLearningTags('', []);
    //       }
    //     });
    //   }
    // } else {
    //   console.log('break point 4');
    //   this.helperService.goBack();
    // }
    if (this.role_name == 'ADMIN' || this.role_name == 'TEACHER') {
      this.nav_links.push({ text: 'Submit', additional_text:'', font_icon:'', click: 'saveStory', click_params: 'submit' });
    }
    // else {
    //   this.nav_links.push({ text: 'Submit', click: 'saveStory', click_params: 'publish' });
    // }
    // this.nav_links.push({ text: 'Preview', click: 'saveStory', click_params: 'preview' });
    // this.nav_links.push({ text: 'Save & Preview', additional_text:'', font_icon:'', click: 'saveStory', click_params: 'draft' });
    this.nav_links.push({ text: '', additional_text:'Cancel', font_icon: '<i class="fa fa-times"></i>', click: 'cancelStory', click_params: '' });
    // this.nav_links.push({ text: '', additional_text:'Delete', font_icon:'<i class="fa fa-trash"></i>', click: 'deleteCreatedStoryPopup', click_params: '' });
    this.school_people_type_array.push({ type: 'Select Performers' });

    this.awsUploadProgressService.getUploadProgressItems().takeUntil(this.unsubscribe$).subscribe((progress_response) => {
      if (progress_response) {
        this.aws_upload_progress_array = progress_response;
      }
    });
  }

  /*
  * Default Angular Life cycle method
  */


  ngOnInit() {
    this.alertService.setTitle('Create Event');//alert service for set title

    // tinymce.init({
    //   menubar: false,
    //   statusbar: false,
    //   paste_text_sticky: true,
    //   selector: '.text_area_plugin',
    //   plugins: ['colorpicker textcolor link'],
    //   skin_url: '../../../assets/skins/lightgray',
    //   toolbar: "fontselect | fontsizeselect | bold italic | alignleft aligncenter alignright | forecolor | bullist numlist | link",
    //   // fontsize_formats: "14px 18px 32px",
    //   fontsize_formats: "Small=14px Medium=22px Large=30px Extra-Large=38px",
    //   font_formats: "Comic Sans MS=comic sans ms,sans-serif;" + "Arial=arial,helvetica,sans-serif;" + "Open Sans=Open Sans;" + "Showcard Gothic=Showcard Gothic;" + "Bodoni MT Black=Bodoni MT Black;" + "Verdana=verdana,geneva;",
    //   toolbar_items_size: 'small',
    //   height: "20px",
    //   // setup : function(ed){
    //   //     ed.on('init', function() 
    //   //     {
    //   //         this.getDoc().body.style.fontSize = '20px';
    //   //         this.getDoc().body.style.fontFamily = 'Comic Sans MS';
    //   //     });
    //   // },
    //   // setup : function(ed) {
    //   //   ed.on('init', function(ed) {
    //   //    ed.target.editorCommands.execCommand("fontName", false, "Comic Sans MS");
    //   //    ed.target.editorCommands.execCommand("fontSize", false, "22px");
    //   //   });
    //   //  },
    // });

    //   $('textarea').each(function() {
    //     $(this).height($(this).prop('scrollHeight'));
    // });

    var obj = this;
    // document.addEventListener("click",(e)=>{
    //   // if($('#camera_image_modal')[0]){
    //   //   if(!document.getElementById('camera_image_modal').contains(<Element>e.target)){
    //   //     // $('#camera_image_modal').modal('hide');
    //   //   }
    //   // }
    // },false);



    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response) => {
      if (response) {
        if (response['user'] && response['user']['id']) {
          obj.user_id = response['user']['id'];
          obj.getTimezones();
          obj.getServiceTaxDetails();
          // obj.getCategoryDetails();
          // if(!localStorage.getItem('story_details')){
          //   //initialize the form with an initial ticketForm
          //   this.ticketFormMain = new FormGroup({
          //     //adding the first formGroup
          //     ticketFormArray: new FormArray([
          //       this.returnNewTicket()
          //     ])
          //   })
          //   this.ticketDisplay.push(false);
          // }
          if (response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {

          } else {
            return obj.helperService.goBack();
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

    // this.router.events.takeUntil(this.unsubscribe$).subscribe((e) => {
    //   console.log(e);
    // });

    this.ticketFormMain = new FormGroup({
      //adding the first formGroup
      ticketFormArray: new FormArray([])
    })

    this.addNewTicket();

    var storyId = null;
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      storyId = paramMap.get('id');
    });
    if (storyId) {
      // var draft_story_details = JSON.parse(localStorage.getItem('story_details'));
      this.restApiService.getData('story/detailed/' + parseInt(storyId), (response) => {
        if (response && response.id) {
          // if(response.caption){
          //   this.story_caption=response.caption;
          // }
          this.edit_story_status = response.status;
          if (response.caption) {
            this.default_text = this.sanitizer.bypassSecurityTrustHtml(response.caption);
            this.default_text_content = new FormControl(response.caption, Validators.required);
          }
          this.story_id = response.id;
          this.user_id = response.userId;

          this.story_created_date = new Date(response.createdAt);
          this.event_type = response.public == true ? 'public' : 'private';
          this.is_published = (response.status == 'PUBLISHED');
          // this.getParentChildren("tag", response.children, () => { });
          // this.restApiService.getData(`story/${this.story_id}/permittedUsers`, (permittedUsers) => {
          //   this.getSchoolPeopleTypeDetails("tag", response.children, permittedUsers);
          // });
          this.getLearningTags("tag", response.tags);
          this.story_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(response.text);
          let container = this.story_content.nativeElement.querySelectorAll('div');
          let container_main_array = Array.prototype.slice.call(container);
          // console.log(container_main_array);
          container_main_array.forEach(main_element => {
            if (main_element.getAttribute("name") == "text") {
              if (main_element.innerHTML) {
                try {
                  var text_value = JSON.parse(main_element.innerHTML);
                  if (text_value && text_value.title && text_value.content) {
                    // this.addEventDescription(unescape(text_value.title), unescape(text_value.content));
                    this.multiple_file_array.push({
                      type: 'text_file', description: new FormGroup({
                        title: new FormControl(unescape(text_value.title), Validators.required),
                        content: new FormControl(unescape(text_value.content), Validators.required)
                      })
                    });
                  }
                } catch (e) {
                  return false;
                }
              }
              this.text_description_status = true;
            }
            if (main_element && main_element.style && main_element.style.backgroundColor) {
              this.story_background_color = main_element.style.backgroundColor;
            }
            let container_child_array = Array.prototype.slice.call(main_element.children);
            container_child_array.every(child_element => {
              // if (child_element.tagName == 'P') {
              //   this.multiple_file_array.push({ type: 'text_file', text_data: this.sanitizer.bypassSecurityTrustHtml(main_element.innerHTML), text_content: main_element.innerHTML });
              // } else 
              if (child_element.tagName == "IMG") {
                if (child_element.dataset.src) {
                  this.multiple_file_array.push({ type: 'image_file', image_src: AWS_DEFAULT_LINK + child_element.dataset.src, upload_type: true, index_value: 0, count: 0, relative_path: child_element.dataset.src });
                }
              } else if (child_element.tagName == "VIDEO") {
                if (child_element.dataset.src) {
                  this.multiple_file_array.push({ type: 'video_file', video_src: AWS_DEFAULT_LINK + child_element.dataset.src, upload_type: true, index_value: 0, count: 0, relative_path: child_element.dataset.src });
                }
              } else if (child_element.tagName == "EMBED") {
                if (child_element.dataset.src) {
                  this.multiple_file_array.push({ type: 'pdf_file', pdf_src: this.sanitizer.bypassSecurityTrustResourceUrl(AWS_DEFAULT_LINK + child_element.dataset.src + '#view=FitH'), upload_type: true, index_value: 0, count: 0, relative_path: child_element.dataset.src });
                }
              }
            });
          });

          if (response.category && response.category.id) {
            this.selectedCategory = response.category.name;
            this.selectedSubCategory = response.category.subName;
            this.selectedSubCategoryId = response.category.id;
          }

          // if(response.chargeType &&  response.chargeType.id){
          //   this.selectedServiceChargeId = response.chargeType.id; 
          // }
          if (response.veneus && Array.isArray(response.veneus) && response.veneus.length > 0) {
            response.veneus.forEach(address_element => {
              this.eventVeneueId = address_element.id;
              this.address_venue = address_element.name;
              this.address_line_1 = address_element.address
              this.address_line_2 = address_element.addressSecondary;
              this.address_city = address_element.city;
              this.address_type = address_element.type;
              this.address_country = address_element.country;
              this.address_pincode = address_element.pincode;
              this.address_state = address_element.state;
              this.address_lat = address_element.lat;
              this.address_lng = address_element.lng;
            });
          }

          if (response.duration && Array.isArray(response.duration) && response.duration.length > 0) {
            response.duration.forEach(duration_element => {
              if (duration_element && duration_element.id) {
                this.eventTimeSpanId = duration_element.id;
                this.event_start_date = new Date(duration_element.utcStart);
                this.event_start_time = new Date(duration_element.utcStart);
                this.event_end_date = new Date(duration_element.utcEnd);
                this.event_end_time = new Date(duration_element.utcEnd);
                if (duration_element.timeZone && duration_element.timeZone.id) {
                  this.selectedTimeZoneId = duration_element.timeZone.id;
                }
              }
            });
          }
          console.log("event time id set as: " + this.eventTimeSpanId);

          if (response.capacities && Array.isArray(response.capacities) && response.capacities.length > 0) {
            response.capacities.sort((a,b)=>{ return a.id - b.id});
            this.assignTicketDetails(response.capacities, (response.status == 'PUBLISHED'));
          }
        } else return this.router.navigateByUrl('/page-not-found');
      });


    } else {
      // this.addEventDescription();
      this.default_text_content = new FormControl(null, Validators.required);
      this.nav_links.push({ text: 'Save & Preview', additional_text:'', font_icon:'', click: 'saveStory', click_params: 'draft' });
    }





  }

  /* Open Default text area */
  openDefaultTextField() {
    $('#default_textfield_div').show();
    $('#default_hide').hide();
    document.getElementById('default_text_field').style.display = 'none';
    $('#default_text_field').hide();
    // if ($('#default_textfield_div').css('display') == 'block') {
    //   tinymce.init({
    //     menubar: false,
    //     statusbar: false,
    //     paste_text_sticky: true,
    //     selector: '.text_area_plugin',
    //     plugins: ['colorpicker textcolor link'],
    //     skin_url: '../../../assets/skins/lightgray',
    //     toolbar: "fontselect |  fontsizeselect | bold italic | alignleft aligncenter alignright | forecolor | bullist numlist | link",
    //     font_formats: "Comic Sans MS=comic sans ms,sans-serif;" + "Arial=arial,helvetica,sans-serif;" + "Open Sans=Open Sans;" + "Showcard Gothic=Showcard Gothic;" + "Bodoni MT Black=Bodoni MT Black;" + "Verdana=verdana,geneva;",
    //     toolbar_items_size: 'small',
    //     // fontsize_formats: "14px 18px 32px",
    //     fontsize_formats: "Small=14px Medium=22px Large=30px Extra-Large=38px",
    //     // setup : function(ed){
    //     //   ed.on('init', function() 
    //     //   {
    //     //       this.getDoc().body.style.fontSize = '20px';
    //     //       this.getDoc().body.style.fontFamily = 'Comic Sans MS';
    //     //   });
    //     // },
    //     // setup : function(ed) {
    //     //   ed.on('init', function(ed) {
    //     //    ed.target.editorCommands.execCommand("fontName", false, "Comic Sans MS");
    //     //    ed.target.editorCommands.execCommand("fontSize", false, "22px");
    //     //   });
    //     //  }
    //   });

    //   if (tinymce.get('default_text_area') && this.default_text_content) {
    //     var text_content = $('#default_showtext_append').html();

    //     tinymce.get('default_text_area').setContent(text_content);
    //   }
    // }
  }

  /* Cancel default text field */
  cancelDefaultText() {
    document.getElementById('default_text_field').style.display = 'block';
    document.getElementById("default_textfield_div").style.display = 'none';
    $('#default_hide').show();
  }

  /* Save Default text field */
  saveDefaultText() {
    $('#default_text_area').empty();
    $('#default_hide').show();
    if (tinymce.get('default_text_area')) {
      var content = tinymce.get('default_text_area').getContent();
      if ($.trim(content) == '') {
        // $('#default_text_area_error').html('Text field should not be empty');
        this.default_text = '';
        // this.default_text_content = '';
        this.default_text_content.patchValue('')
        document.getElementById("default_textfield_div").style.display = 'none';
        document.getElementById('default_text_field').style.display = 'block';
      } else {
        this.default_text = this.sanitizer.bypassSecurityTrustHtml(content);
        this.default_text_content.patchValue(content);
        document.getElementById("default_textfield_div").style.display = 'none';
        document.getElementById('default_text_field').style.display = 'block';
      }
    }
  }


  /* 
  * Add Panel with respect to ID
  */
  addPanel(index_value) {
    if (this.clickSub) return;
    $('#panel_first').hide();
    this.multiple_file_array.forEach((element, index) => {
      $('#panel_' + index).hide();
      $('#panel_first').hide();
    });
    $('#panel_' + index_value).toggle();
    setTimeout(() => {
      this.clickSub = this.renderer.listen(document, 'click', (event) => {
        this.multiple_file_array.forEach((element, index) => {
          $('#panel_' + index).hide();
        });
        $('#panel_first').hide();
        this.clickSub();
        this.clickSub = null;
      });
    }, 200);
  }

  removePanel() {
    this.multiple_file_array.forEach((element, index) => {
      $('#panel_' + index).hide();
      $('#panel_first').hide();
    });
  }

  /* 
  * NgFor track By index function
  */
  trackByFn(index, item) {
    return index; // or item.id
  }

  /* 
  * Open Text Field with respect to ID 
  */
  editText(index_value, action_type) {
    document.getElementById("panel_" + index_value).style.display = 'none';
    // $('#textfield_' + index_value).toggle();
    this.makeScroll('edit_text');
    if (index_value) {
      if (document.getElementById('textfield_' + index_value + '_showtext_div'))
        document.getElementById('textfield_' + index_value + '_showtext_div').style.display = 'block';

    }
















    // new FormGroup({
    //   title: new FormControl(null, Validators.required),
    //   content: new FormControl(null, Validators.required)
    // })
    // if ($('#textfield_' + index_value).css('display') == 'block') {
    //   tinymce.init({
    //     menubar: false,
    //     statusbar: false,
    //     paste_text_sticky: true,
    //     selector: '.text_area_plugin',
    //     plugins: ['colorpicker textcolor link'],
    //     skin_url: '../../../assets/skins/lightgray',
    //     toolbar: "fontselect |  fontsizeselect | bold italic | alignleft aligncenter alignright | forecolor | bullist numlist | link",
    //     // fontsize_formats: "14px 18px 32px",
    //     fontsize_formats: "Small=14px Medium=22px Large=30px Extra-Large=38px",
    //     font_formats: "Comic Sans MS=comic sans ms,sans-serif;" + "Arial=arial,helvetica,sans-serif;" + "Open Sans=Open Sans;" + "Showcard Gothic=Showcard Gothic;" + "Bodoni MT Black=Bodoni MT Black;" + "Verdana=verdana,geneva;",
    //     toolbar_items_size: 'small',
    //     // setup : function(ed){
    //     //   ed.on('init', function() 
    //     //   {
    //     //       this.getDoc().body.style.fontSize = '20px';
    //     //       this.getDoc().body.style.fontFamily = 'Comic Sans MS';
    //     //   });
    //     // },
    //     // setup : function(ed) {
    //     //   ed.on('init', function(ed) {
    //     //    ed.target.editorCommands.execCommand("fontName", false, "Comic Sans MS");
    //     //    ed.target.editorCommands.execCommand("fontSize", false, "22px");
    //     //   });
    //     //  }
    //   });
    // }

    // for (var i = tinymce.editors.length - 1; i > -1; i--) {
    //   var ed_id = tinymce.editors[i].id;
    //   if (ed_id != 'text_area_element_' + index_value) {
    //     var open_div_test = ed_id.split("_");
    //     if (open_div_test[open_div_test.length - 1] != 'area') {
    //       tinymce.get(ed_id).setContent('');
    //       $('#textfield_' + open_div_test[open_div_test.length - 1]).attr('style', 'display:none');
    //       tinymce.execCommand("mceRemoveEditor", true, ed_id);
    //     }
    //   }
    // }

    // if (typeof this.listenFunc == 'function') {
    //   this.listenFunc();
    // }

    // if (action_type == 'edit') {
    //   if (typeof this.multiple_file_array[index_value].text_data.changingThisBreaksApplicationSecurity != 'undefined') {
    //     var text_content = $('#textfield_' + index_value + '_showtext_append').html();
    //     tinymce.get('text_area_element_' + index_value).setContent(text_content);
    //     let element = document.getElementById('button_save_text_' + index_value);
    //     this.listenFunc = this.renderer.listen(element, 'click', (e) => {
    //       e.stopImmediatePropagation();
    //       this.saveText(index_value, 'edit');
    //     });
    //   }
    // } else {
    //   tinymce.get('text_area_element_' + index_value).setContent('');
    //   let element = document.getElementById('button_save_text_' + index_value);
    //   this.listenFunc = this.renderer.listen(element, 'click', (e) => {
    //     e.stopImmediatePropagation();
    //     this.saveText(index_value, '');
    //   });
    // }



    if (document.getElementById('textfield_' + index_value + '_showtext_div'))
      document.getElementById('textfield_' + index_value + '_showtext_div').style.display = 'block';
  }

  /* 
  * Cancel Text Editor 
  */
  cancelOpenTextEditor(index_value) {
    tinymce.execCommand("mceRemoveEditor", true, 'text_area_element_' + index_value);
    $('#textfield_' + index_value).attr('style', 'display:none');
    if (document.getElementById('textfield_' + index_value + '_showtext_div'))
      document.getElementById('textfield_' + index_value + '_showtext_div').style.display = 'block';
  }

  /* 
  * Save Text editor value 
  */
  saveText(index_value, action_type) {
    if (tinymce.get('text_area_element_' + index_value)) {
      var content = tinymce.get('text_area_element_' + index_value).getContent();
      $("#text_area_element_" + index_value + "_error").empty();
      if ($.trim(content) == '') {
        $("#text_area_element_" + index_value + "_error").html('Text field should not be empty');
      } else {
        this.listenFunc();
        if (action_type == 'edit') {
          this.multiple_file_array.splice(index_value, 1);
          this.multiple_file_array.splice(index_value, 0, { type: 'text_file', text_data: this.sanitizer.bypassSecurityTrustHtml(content), text_content: content });
          // document.getElementById('textfield_'+index_value+'_showtext_div').style.display = 'block';
        } else {
          if (index_value == 'first') {
            this.multiple_file_array.push({ type: 'text_file', text_data: this.sanitizer.bypassSecurityTrustHtml(content), text_content: content });
          } else {
            this.multiple_file_array.splice(index_value, 0, { type: 'text_file', text_data: this.sanitizer.bypassSecurityTrustHtml(content), text_content: content });
          }
        }
        tinymce.get('text_area_element_' + index_value).setContent('');
        tinymce.execCommand("mceRemoveEditor", true, 'text_area_element_' + index_value);
        $("#textfield_" + index_value).attr('style', 'display:none');
        $('#panel_' + index_value).attr('style', 'display:none');
        if (document.getElementById('textfield_' + index_value + '_showtext_div'))
          document.getElementById('textfield_' + index_value + '_showtext_div').style.display = 'block';
      }
    }
    this.makeScroll('');
  }

  /*
  * Function to upload image, video, pdf based on action type
  */
  uploadPanelDocType(index_value, action_type) {
    this.fileInput.nativeElement.value = '';
    if (action_type == 'image') {
      if (this.exceedsFileTypeCount('image')) {
        this.alertService.showNotification('You have exceeded the maximum number of images', 'error')
        return
      }
      this.fileInput.nativeElement.accept = '.jpg,.png,.jpeg';
    } else if (action_type == 'video') {
      if (this.exceedsFileTypeCount('video')) {
        this.alertService.showNotification('You have exceeded the maximum number of videos', 'error')
        return
      }
      this.fileInput.nativeElement.accept = '.mp4,.WebM,.Ogg';
    } else if (action_type == 'pdf') {
      if (this.exceedsFileTypeCount('pdf')) {
        this.alertService.showNotification('You have exceeded the maximum number of pdfs', 'error')
        return
      }
      this.fileInput.nativeElement.accept = '.pdf';
    }
    this.click_element_type_array.length = 0;
    this.click_element_type_array.push({ index_value: index_value, action_type: action_type })
    this.fileInput.nativeElement.click();
  }

  /*
  * Function to show image and make a call to upload to server
  */
  fileChanged(event) {
    if (this.click_element_type_array.length == 1) {
      this.click_element_type_array.forEach(async element => {
        if (element.action_type) {
          let files = event.target.files;
          let index_value = element.index_value;
          let count = 1;
          if (files) {
            for (let file of files) {
              if (element.action_type == 'image' || element.action_type == 'video' || element.action_type == 'pdf') {
                if (this.checkFileExtenstion(file, element.action_type)) {
                  if(element.action_type == 'image'){ 
                    console.log('hit true');
                    await this.helperService.compress(file).toPromise().then((compressed)=>{
                      console.log('resolved');
                      file = compressed
                    });
                    console.log(file);
                  }
                  let reader = new FileReader();
                  reader.onload = (e: any) => {
                    if (element.action_type == 'image') {
                      if (this.exceedsFileTypeCount('image')) return;
                      if (index_value != 'first') {
                        this.multiple_file_array.splice(index_value, 0, { type: 'image_file', image_src: e.target.result, upload_type: false, index_value: index_value, count: count });
                      } else {
                        this.multiple_file_array.splice(this.multiple_file_array.length, 0, { type: 'image_file', image_src: e.target.result, upload_type: false, index_value: index_value, count: count });
                      }
                    } else if (element.action_type == 'video') {
                      if (this.exceedsFileTypeCount('video')) return;
                      if (index_value != 'first') {
                        this.multiple_file_array.splice(index_value, 0, { type: 'video_file', video_src: e.target.result, upload_type: false, index_value: index_value, count: count });
                      } else {
                        this.multiple_file_array.splice(this.multiple_file_array.length, 0, { type: 'video_file', video_src: e.target.result, upload_type: false, index_value: index_value, count: count });
                      }
                    } else if (element.action_type == 'pdf') {
                      if (this.exceedsFileTypeCount('pdf')) return;
                      if (index_value != 'first') {
                        this.multiple_file_array.splice(index_value, 0, { type: 'pdf_file', pdf_src: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result), upload_type: false, index_value: index_value, count: count });
                      } else {
                        this.multiple_file_array.splice(this.multiple_file_array.length, 0, { type: 'pdf_file', pdf_src: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result), upload_type: false, index_value: index_value, count: count });
                      }
                    }
                    
                    this.saveToDb(file, element.action_type, index_value, count, e.target.result);
                    count++;
                  }
                  reader.readAsDataURL(file);
                }
              } else {
                this.alertService.showNotification('Something went wrong, Please try again', 'error');
                return false;
              }
            }
            if (document.getElementById('panel_' + element.index_value))
              document.getElementById('panel_' + element.index_value).style.display = 'none';
          }
        }
      });
    }
  }

  /* 
  * Helper Function to check file extension
  */
  checkFileExtenstion(file: File, type_data) {
    if (file !== undefined && file && file instanceof File) {
      var file_data = file;
      var ext: any = file_data.name.toLowerCase().split(".");
      ext = ext[ext.length - 1].toLowerCase();
      var arrayExtensions, ext_type1, ext_type2, ext_type3;
      if (type_data == 'image' || type_data == 'camera') {
        arrayExtensions = ["jpg", "jpeg", "png"];
        ext_type1 = 'image/jpeg';
        ext_type2 = 'image/png';
        ext_type3 = 'image/jpg';
        if (file.size > 5242880) {
          this.alertService.showNotification('Image size should be less than 5MB', 'error');
          return false;
        }
      } else if (type_data == 'video') {
        arrayExtensions = ["mp4", "WebM", "Ogg"];
        ext_type1 = 'video/mp4';
        ext_type2 = 'video/WebM';
        ext_type3 = 'video/Ogg';
      } else if (type_data == 'pdf') {
        arrayExtensions = ["pdf"];
        ext_type1 = 'application/pdf';
      } else {
        this.alertService.showNotification('Something went wrong, Please try again', 'error');
        return false;
      }
      if (file_data.type == ext_type1 || file_data.type == ext_type2 || file_data.type == ext_type3) {
        if (file_data.size < 31457280) {
          return true;
        } else {
          this.alertService.showNotification('Size should be less than 30MB', 'error');
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
  * Function to save snap (image, video, pdf)
  */
  async saveToDb(file_data, type_sent, index_value, count, file_data_src) {

    if (!this.school_id && !this.user_id) {
      this.alertService.showNotification('Something went wrong, Please try again', 'error');
      return false;
    }
    this.awsImageuploadService.uploadFileToAWS(file_data, 'story/' + this.school_id, count, (aws_image_upload_response) => {
      if (aws_image_upload_response && aws_image_upload_response.Location && aws_image_upload_response.key) {
        var check_id = this.multiple_file_array.filter((snap) => { return snap.relative_path === aws_image_upload_response.key });
        if (check_id.length == 0) {
          if (type_sent == 'image') {
            var check_id_index = this.multiple_file_array.findIndex((snap) => { return snap.index_value == index_value && !snap.id && !snap.upload_type && snap.count == count && snap.type == 'image_file' });
            if (check_id_index > -1) {
              this.multiple_file_array[check_id_index].type = 'image_file';
              this.multiple_file_array[check_id_index].image_src = AWS_DEFAULT_LINK + aws_image_upload_response.key;
              this.multiple_file_array[check_id_index].upload_type = true;
              this.multiple_file_array[check_id_index].index_value = 0;
              this.multiple_file_array[check_id_index].count = 0;
              this.multiple_file_array[check_id_index].relative_path = aws_image_upload_response.key;
            }
          } else if (type_sent == 'video') {
            var check_id_index = this.multiple_file_array.findIndex((snap) => { return snap.index_value == index_value && !snap.id && !snap.upload_type && snap.count == count && snap.type == 'video_file' });
            if (check_id_index > -1) {
              this.multiple_file_array[check_id_index].type = 'video_file';
              this.multiple_file_array[check_id_index].video_src = AWS_DEFAULT_LINK + aws_image_upload_response.key;
              this.multiple_file_array[check_id_index].upload_type = true;
              this.multiple_file_array[check_id_index].index_value = 0;
              this.multiple_file_array[check_id_index].count = 0;
              this.multiple_file_array[check_id_index].relative_path = aws_image_upload_response.key;
            }
          } else if (type_sent == 'pdf') {
            var check_id_index = this.multiple_file_array.findIndex((snap) => { return snap.index_value == index_value && !snap.id && !snap.upload_type && snap.count == count && snap.type == 'pdf_file' });
            if (check_id_index > -1) {
              this.multiple_file_array[check_id_index].type = 'pdf_file';
              // this.multiple_file_array[check_id_index].pdf_src = this.sanitizer.bypassSecurityTrustResourceUrl(file_data_src);
              this.multiple_file_array[check_id_index].pdf_src = this.sanitizer.bypassSecurityTrustResourceUrl(AWS_DEFAULT_LINK + aws_image_upload_response.key);
              this.multiple_file_array[check_id_index].upload_type = true;
              this.multiple_file_array[check_id_index].index_value = 0;
              this.multiple_file_array[check_id_index].count = 0;
              this.multiple_file_array[check_id_index].relative_path = aws_image_upload_response.key;
            }
          }
        }
      } else {
        // var check_index= this.multiple_file_array.findIndex((snap)=> snap.count == count);
        // if(check_index>-1){
        //   this.multiple_file_array.splice(check_index,1);
        // }

        console.log('here we handle upload error');
        if (this.click_element_type_array[0].index_value === 'first') this.multiple_file_array.splice(this.multiple_file_array.length - 1, 1);
        else this.multiple_file_array.splice(this.click_element_type_array[0].index_value, 1);
        this.alertService.showNotification('Something went wrong, Please try again', 'error');
        return false;
      }
    });
    this.makeScroll(type_sent);
  }

  /* 
  * Popup open for delete confirmation 
  */
  openDeleteConfirmationPopup(index_value, snap_type, relative_path) {
    this.delete_index_value = index_value;
    this.snap_type = snap_type;
    this.relative_path_value = relative_path;
    $('#delete_multiple_items_popup_div').modal('show');
  }

  /* 
  * Popup cancel for delete confirmation 
  */
  closeDeletePopupElement() {
    this.delete_index_value = '';
    this.snap_type = '';
    this.relative_path_value = '';
    $('#delete_multiple_items_popup_div').modal('hide');
  }
  /* 
  * Delete added image,pdf,video items 
  */
  deleteMultipleItems(index_value, snap_type, relative_path) {
    if (snap_type == 'text') {
      this.multiple_file_array.splice(index_value, 1);
      $('#delete_multiple_items_popup_div').modal('hide');
    } else if (snap_type == 'snap') {
      var checked_index_value = this.multiple_file_array.findIndex(obj => obj.relative_path == relative_path);
      if (checked_index_value == index_value) {
        if (relative_path) {
          this.awsImageuploadService.deleteFile(relative_path, (response) => { })
        }
        this.multiple_file_array.splice(index_value, 1);
        $('#delete_multiple_items_popup_div').modal('hide');
      }
    }
  }

  /* 
  * Get Learning Tags based on school 
  */
  getLearningTags(type, learning_tags_id_array) {
    this.learning_tags.length = 0;
    if (this.school_id) {
      this.restApiService.getData('learningTags/school/' + this.school_id, (response) => {
        if (response) {
          response.forEach(element => {
            var check_id = this.learning_tags.filter((details) => { return details.id === element.id });
            if (check_id.length == 0) {
              element['tagged_status'] = false;
              this.learning_tags.push(element);
            }
          });
          if (type == 'tag' && learning_tags_id_array) {
            if (learning_tags_id_array && Array.isArray(learning_tags_id_array) && learning_tags_id_array.length > 0) {
              learning_tags_id_array.forEach(element => {
                if (this.learning_tags.length > 0) {
                  var index_value = this.learning_tags.findIndex(obj => obj.id == parseInt(element.id));
                  if (index_value > -1) {
                    if (typeof this.learning_tags[index_value] !== 'undefined') {
                      this.learning_tags[index_value]['tagged_status'] = true;
                      this.learning_tags_selected_status = true;
                    }
                  }
                }
              });
            }
          }
        }
      });
    }
  }

  /* 
  * Create Learning tag pop-up open 
  */
  openCreateLearningTagPopup() {
    this.learning_tag_name = '';
    this.learning_tag_description = '';
    document.getElementById('learning_tag_name_error').innerHTML = '';
    document.getElementById('learning_tag_description_error').innerHTML = '';
    document.getElementById('duplicate_learning_tag_error').innerHTML = '';
    $('#create_learning_tag_popup_div').modal('show');
  }

  /* 
  * Create Learning tag pop-up close 
  */
  closeCreateLearningTagPopup() {
    this.learning_tag_name = '';
    this.learning_tag_description = '';
    $('#create_learning_tag_popup_div').modal('hide');
  }

  /*
  * Save Learning Tags 
  */
  saveLearningTags() {
    if (!this.school_id && !this.user_id) {
      this.alertService.showNotification('Something went wrong, please try again', 'error');
      return false;
    }
    document.getElementById('learning_tag_name_error') ? document.getElementById('learning_tag_name_error').innerHTML = '' : '';
    document.getElementById('learning_tag_description_error') ? document.getElementById('learning_tag_description_error').innerHTML = '' : '';
    document.getElementById('duplicate_learning_tag_error') ? document.getElementById('duplicate_learning_tag_error').innerHTML = '' : '';
    if (!this.learning_tag_name.trim()) {
      document.getElementById('learning_tag_name_error').innerHTML = 'Tag name is required';
      return false;
    }
    if (!this.learning_tag_description.trim()) {
      document.getElementById('learning_tag_description_error').innerHTML = 'Tag description is required';
      return false;
    }
    this.learning_tag_name = this.learning_tag_name.trim();
    this.learning_tag_description = this.learning_tag_description.trim();
    var array_check = this.learning_tags.filter((tags) => { return tags.tag == this.learning_tag_name; });
    if (array_check.length == 0) {
      var learning_tags_creating_details = {
        "schoolId": this.school_id,
        "userId": this.user_id,
        "tag": this.learning_tag_name,
        "description": this.learning_tag_description,
      }
      this.restApiService.postAPI('learningTags/add', learning_tags_creating_details, (response) => {
        var array_check = this.learning_tags.filter((details) => { return details.id == response.id });
        if (array_check.length == 0) {
          this.learning_tags.push(response);
        }
      });
      $('#create_learning_tag_popup_div').modal('hide');
    } else {
      document.getElementById('duplicate_learning_tag_error').innerHTML = 'Same learning tag present, please choose different name';
      return false;
    }
  }

  /* 
  * Select learning tags from the list 
  */
  selectLearningTags(learning_tags_id) {
    if (this.learning_tags && this.learning_tags.length > 0) {
      var index_value = this.learning_tags.findIndex(obj => obj.id == parseInt(learning_tags_id));
      if (index_value > -1) {
        if (typeof this.learning_tags[index_value] !== 'undefined') {
          this.learning_tags[index_value]['tagged_status'] = true;
        }
      }
      this.learning_tags_selected_status = false;
      this.learning_tags.forEach(element => {
        if (element.tagged_status) {
          this.learning_tags_selected_status = true;
        }
      });
    }
  }

  /* 
  * Remove Selected tags from the list 
  */
  removeSelectedTagName(learning_tags_id) {
    if (this.learning_tags && this.learning_tags.length > 0) {
      var index_value = this.learning_tags.findIndex(obj => obj.id == parseInt(learning_tags_id));
      if (index_value > -1) {
        if (typeof this.learning_tags[index_value] !== 'undefined') {
          this.learning_tags[index_value]['tagged_status'] = false;
        }
      }
      this.learning_tags_selected_status = false;
      this.learning_tags.forEach(element => {
        if (element.tagged_status) {
          this.learning_tags_selected_status = true;
        }
      });
    }
  }

  /* 
  * Remove Created Learning Tags
  */
  deleteCreatedLearningTag(learning_tag_id) {
    if (this.role_name == 'ADMIN' || this.role_name == 'TEACHER') {
      this.restApiService.deleteAPI('learningTags/' + learning_tag_id, (response) => {
        var index_value = this.learning_tags.findIndex(obj => obj.id == parseInt(learning_tag_id));
        if (index_value > -1) {
          this.learning_tags.splice(index_value, 1);
        }
      });
    } else {
      this.alertService.showNotification('Something went wrong, Please try again', 'error');
      return false;
    }
  }

  /* 
  * Filter learning tags
  */
  applyFilterForLearningTags(filter: String) {
    var search = this.learning_tags.filter(item => {
      if (item.tag.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
        return true;
      }
      return false;
    });
    this.learning_tags_search = search;
  }

  /* 
  * show people tagged popup
  */
  showPeopleTaggedList() {
    document.getElementById('people_list_tag').style.display = 'block';
  }

  /*
  * save tagged people
  */
  savePeopleTaggedList() {
    document.getElementById('people_list_tag').style.display = 'none';
  }

  /*
  * Function to get school people type details
  */
  getSchoolPeopleTypeDetails(type, school_children_array, school_teacher_array) {
    if (this.school_id && (this.role_name == 'ADMIN' || this.role_name == 'TEACHER')) {
      this.school_people_type_array.push({ type: 'Select Performers' });
      // this.school_people_type_array.push({type:'School Staff'});
      // this.getSchoolChildren(type, school_children_array);
      // this.getSchoolTeacher(type, school_teacher_array);
    }
  }

  /*
  * save tagged people
  */
  onChangeSelectPeopleType(event) {
    this.selectedPeopleType = event;
  }

  /*
  * Function to get Children for login user
  */
  getParentChildren(type, parent_child_array, callback) {
    if (this.user_id && this.school_id) {
      this.restApiService.getData('parent/getRegisteredChild/parent/' + this.user_id + '/school/' + this.school_id, (child_response) => {
        if (child_response && Array.isArray(child_response) && child_response.length > 0) {
          child_response.forEach(element => {
            if (element && element.id) {
              var check_id = this.parent_children_array.filter((details) => { return details.id === element.id });
              if (check_id.length == 0) {
                var child = [];
                child['id'] = element.id;
                if (element['defaultSnapId']) {
                  this.restApiService.getData('snap/' + element['defaultSnapId'], (snap_details_response) => {
                    if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                      child['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                    }
                  });
                } else {
                  child['staticDpImg'] = '';
                }
                child['firstName'] = element.firstName;
                child['lastName'] = element.lastName;
                child['tagged_status'] = false;
                child['type'] = 'parent_children';
                this.parent_children_array.push(child);
              }
            }
          });
          if (type == 'tag' && parent_child_array) {
            if (parent_child_array && Array.isArray(parent_child_array) && parent_child_array.length > 0) {
              parent_child_array.forEach(element => {
                if (this.parent_children_array.length > 0) {
                  var index_value = this.parent_children_array.findIndex(obj => obj.id == parseInt(element.id));
                  if (index_value > -1) {
                    if (typeof this.parent_children_array[index_value] !== 'undefined') {
                      this.parent_children_array[index_value]['tagged_status'] = true;
                      this.tagged_people_status = true;
                      this.tagged_people_class_status = true;
                    }
                  }
                }
              });
            }
          }
        }
        return callback && callback(true);
      });
    } else {
      this.alertService.showNotification('Something went wrong, Please try again', 'error');
      return callback && callback(true);
    }
  }

  /* 
  * Get School Children details 
  */
  getSchoolChildren(type, children_array) {
    if (this.school_id) {
      this.restApiService.getData('user/getStudentsBySchool/' + this.school_id, (response) => {
        if (response && Array.isArray(response) && response.length > 0) {
          response.forEach(element => {
            if (element.status) {
              var check_id = this.school_children_array.filter((details) => { return details.id === element.child.id });
              if (check_id.length == 0) {
                let staticDpImg = '';
                if (element.child['defaultSnapId']) {
                  this.restApiService.getData('snap/' + element.child['defaultSnapId'], (snap_details_response) => {
                    if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                      staticDpImg = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                    }
                  });
                }
                var student = {
                  id: element.child.id, firstName: element.child.firstName, lastName: element.child.lastName, tagged_status: false,
                  staticDpImg: staticDpImg, type: 'school_children'
                };
                this.school_children_array.push(student);
              }
            }
          });
          if (this.school_children_array && this.school_children_array.length > 0 && this.parent_children_array && this.parent_children_array.length > 0) {
            this.parent_children_array.forEach(element => {
              var index_value = this.school_children_array.findIndex(obj => obj.id == parseInt(element.id));
              if (index_value > -1) {
                this.school_children_array.splice(index_value, 1);
              }
            });
          }
          if (type == "tag" && children_array) {
            if (children_array && Array.isArray(children_array) && children_array.length > 0) {
              children_array.forEach(element => {
                if (this.school_children_array.length > 0) {
                  var index_value = this.school_children_array.findIndex(obj => obj.id == parseInt(element.id));
                  if (index_value > -1) {
                    if (typeof this.school_children_array[index_value] !== 'undefined') {
                      this.school_children_array[index_value]['tagged_status'] = true;
                      this.tagged_people_status = true;
                      this.tagged_people_class_status = true;
                    }
                  }
                }
              });
            }
          }
        }
      });
    }
  }

  /*
  * Function to get School Teacher
  */
  getSchoolTeacher(type, tagged_user_id) {
    if (this.school_id) {
      this.restApiService.getData('teacher/request/school/' + this.school_id, (school_teacher_response) => {
        if (school_teacher_response && Array.isArray(school_teacher_response) && school_teacher_response.length > 0) {
          school_teacher_response.forEach(element => {
            if (element.teacher && element.user && element.user.userProfile) {
              if (this.user_id !== element.user.id) {
                var check_id = this.school_teacher_array.filter((details) => { return details.id === element.user.id; });
                if (check_id.length == 0) {
                  var teacher = [];
                  teacher['id'] = element.user.id;
                  teacher['firstName'] = element.user.userProfile.firstName;
                  teacher['lastName'] = element.user.userProfile.lastName;
                  teacher['tagged_status'] = false;
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
                  this.school_teacher_array.push(teacher);
                }
              }
            }
          });
          if (type == 'tag' && tagged_user_id) {
            if (tagged_user_id && Array.isArray(tagged_user_id) && tagged_user_id.length > 0) {
              tagged_user_id.forEach(element => {
                if (this.school_teacher_array.length > 0) {
                  var index_value = this.school_teacher_array.findIndex(obj => obj.id == parseInt(element.id));
                  if (index_value > -1) {
                    if (typeof this.school_teacher_array[index_value] !== 'undefined') {
                      this.school_teacher_array[index_value]['tagged_status'] = true;
                      this.tagged_people_status = true;
                      this.tagged_people_class_status = true;
                    }
                  }
                }
              });
            }
          }
        }
      });
      this.restApiService.getData('user/admin/requests/bySchool/' + this.school_id, (response) => {
        if (response && Array.isArray && response.length > 0) {
          response.forEach(element => {
            if (element.admin && element.user && element.user.id && element.user.userProfile) {
              if (this.user_id !== element.user.id) {
                var check_id = this.school_teacher_array.filter((details) => { return details.id === element.user.id; });
                if (check_id.length == 0) {
                  var admin = [];
                  admin['id'] = element.user.id;
                  admin['firstName'] = element.user.userProfile.firstName;
                  admin['lastName'] = element.user.userProfile.lastName;
                  admin['tagged_status'] = false;
                  if (element.user.userProfile['defaultSnapId']) {
                    this.restApiService.getData('snap/' + element.user.userProfile['defaultSnapId'], (snap_details_response) => {
                      if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                        admin['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                      }
                    });
                  } else {
                    admin['staticDpImg'] = '';
                  }
                  admin['type'] = 'school_teacher';
                  this.school_teacher_array.push(admin);
                }
              }
            }
          });
          if (type == 'tag' && tagged_user_id) {
            if (tagged_user_id && Array.isArray(tagged_user_id) && tagged_user_id.length > 0) {
              tagged_user_id.forEach(element => {
                if (this.school_teacher_array.length > 0) {
                  var index_value = this.school_teacher_array.findIndex(obj => obj.id == parseInt(element.id));
                  if (index_value > -1) {
                    if (typeof this.school_teacher_array[index_value] !== 'undefined') {
                      this.school_teacher_array[index_value]['tagged_status'] = true;
                      this.tagged_people_status = true;
                      this.tagged_people_class_status = true;
                    }
                  }
                }
              });
            }
          }
        }
      });

    }
  }

  /*
  * Function to tagged people based on type of action
  */
  tagPeoples(id, type) {
    if (id && type) {
      if (type == 'parent_children') {
        var check_id = this.parent_children_array.filter((details) => { return details.id === parseInt(id) && details.tagged_status === true });
        if (check_id.length == 0) {
          var index_value = this.parent_children_array.findIndex(obj => obj.id == parseInt(id));
          if (index_value > -1) {
            if (typeof this.parent_children_array[index_value] !== 'undefined') {
              this.parent_children_array[index_value]['tagged_status'] = true;
            }
          }
        } else {
          var index_value = this.parent_children_array.findIndex(obj => obj.id == parseInt(id));
          if (index_value > -1) {
            if (typeof this.parent_children_array[index_value] !== 'undefined') {
              this.parent_children_array[index_value]['tagged_status'] = false;
            }
          }
        }
      } else if (type == 'school_children') {
        var check_id = this.school_children_array.filter((details) => { return details.id === parseInt(id) && details.tagged_status === true });
        if (check_id.length == 0) {
          var index_value = this.school_children_array.findIndex(obj => obj.id == parseInt(id));
          if (index_value > -1) {
            if (typeof this.school_children_array[index_value] !== 'undefined') {
              this.school_children_array[index_value]['tagged_status'] = true;
            }
          }
        } else {
          var index_value = this.school_children_array.findIndex(obj => obj.id == parseInt(id));
          if (index_value > -1) {
            if (typeof this.school_children_array[index_value] !== 'undefined') {
              this.school_children_array[index_value]['tagged_status'] = false;
            }
          }
        }
      } else if (type == 'school_teacher') {
        var check_id = this.school_teacher_array.filter((details) => { return details.id === parseInt(id) && details.tagged_status === true });
        if (check_id.length == 0) {
          var index_value = this.school_teacher_array.findIndex(obj => obj.id == parseInt(id));
          if (index_value > -1) {
            if (typeof this.school_teacher_array[index_value] !== 'undefined') {
              this.school_teacher_array[index_value]['tagged_status'] = true;
            }
          }
        } else {
          var index_value = this.school_teacher_array.findIndex(obj => obj.id == parseInt(id));
          if (index_value > -1) {
            if (typeof this.school_teacher_array[index_value] !== 'undefined') {
              this.school_teacher_array[index_value]['tagged_status'] = false;
            }
          }
        }
      }
    }

    this.tagged_people_status = false;
    this.tagged_people_class_status = false;

    if (this.parent_children_array && this.parent_children_array.length > 0) {
      this.parent_children_array.forEach(element => {
        if (element.tagged_status) {
          this.tagged_people_status = true;
          this.tagged_people_class_status = true;
        }
      });
    }

    if (!this.tagged_people_status) {
      if (this.school_children_array && this.school_children_array.length > 0) {
        this.school_children_array.forEach(element => {
          if (element.tagged_status) {
            this.tagged_people_status = true;
            this.tagged_people_class_status = true;
          }
        });
      }
    }

    if (!this.tagged_people_status) {
      if (this.school_teacher_array && this.school_teacher_array.length > 0) {
        this.school_teacher_array.forEach(element => {
          if (element.tagged_status) {
            this.tagged_people_status = true;
            this.tagged_people_class_status = true;
          }
        });
      }
    }
  }

  /*
  |* Delete Created story
  |*/
  deleteCreatedStoryPopup() {
    $('#alert_delete_story_popup').modal('show');
  }

  deleteStoryConfirmationSubmit() {
    this.allowNavigation = true;
    $('#alert_delete_story_popup').modal('hide');
    if (this.story_id) {
      var draft_story_details = this.story_id;
      if (draft_story_details) {
        this.restApiService.getData('story/' + draft_story_details, (story_response) => {
          if (story_response && story_response.id) {
            this.restApiService.postAPI('story/' + draft_story_details + "/state/delete", 0, (response) => {
              //todo delete
              // console.log('this is delete response api')
              // console.log(response);
              localStorage.removeItem('story_details');
              localStorage.removeItem('story_creation_type_details');
              this.alertService.showAlertBottomNotification("Event activity deleted");
              setTimeout(() => { this.helperService.goBack(); }, 500);
              this.getImagesRelativePath(story_response.text, (relative_path_response) => {
                if (relative_path_response && Array.isArray(relative_path_response) && relative_path_response.length > 0) {
                  relative_path_response.forEach(element => {
                    if (element.relative_path) {
                      this.awsImageuploadService.deleteFile(element.relative_path, () => { });
                    }
                  });
                }
              });
            });
          }
        })
      }
    } else {
      localStorage.removeItem('story_creation_type_details');
      this.helperService.goBack();
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
  * Story if it saved move to draft state
  */
  cancelStory() {
    this.allowNavigation = true;
    $('#alert_cancel_story').modal('show');
  }
  cancelstoryalert() {
    this.allowNavigation = false;
    $('#alert_cancel_story').modal('hide');
  }
  canceleditstory() {
    localStorage.removeItem('story_details');
    localStorage.removeItem('story_creation_type_details');
    this.allowNavigation = true;
    this.helperService.goBack();
    $('#alert_cancel_story').modal('hide');

  }

  /* After View Init */
  ngAfterViewInit() {

  }

  /*
  * Angular default life cycle destroy method 
  */
  ngOnDestroy() {
    if (tinymce) {
      tinymce.remove();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /*
  * Helper function to scroll 
  */
  makeScroll(type) {
    var val = 400;
    if (type == 'pdf') {
      val = 550;
    } else if (type == 'edit_text') {
      val = 200;
    }
    var scroll = $('#left').scrollTop();
    if (scroll == 0) {
      scroll = scroll + val;
      $('#left').animate({
        scrollTop: scroll
      }, 1000);
    } else {
      scroll = scroll + val;
      $('#left').animate({
        scrollTop: scroll
      }, 1000);
    }
  }

  // previewStory() {
  //   this.router.navigateByUrl('/event-preview');
  // }
  /*
  * Function to save or submit story based on action type 
  */
  saveStory(action_type) {
    //wrap into touch FG function
    this.default_text_content.markAsTouched();
    (<FormGroup[]>this.eventDescriptionArray.controls).forEach((fg: FormGroup) => {
      if (fg.untouched) {
        fg.controls.title.markAsTouched();
        fg.controls.content.markAsTouched();
      }
    })

    this.multiple_file_array.forEach((element) => {
      if (element.type == 'text_file') {
        element.description.controls.content.markAsTouched();
        element.description.controls.title.markAsTouched();
      }
    })



    let condition_check_count = 0;

    if (!this.default_text_content.value) {
      var temp = this.completeForm.nativeElement.querySelector('.ng-invalid');
      if (temp) {
        temp.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        temp.focus();
      }
      this.alertService.showNotification('Event title field is required', 'error');
      return false;
    }

    if (this.multiple_file_array.length == 0) {
      var formG = this.addEventDescription();
      formG.get('title').markAsTouched();
      this.alertService.showNotification('Section title field is required', 'error');
      return false;
    }

    if (this.multiple_file_array.length > 0) {
      var total_snap_count = 0;
      this.multiple_file_array.forEach(element => {
        if (element.type !== 'text_file') {
          total_snap_count += 1;
        }
      });
      if (total_snap_count > 15) {
        this.alertService.showNotification('Number of attachment should be less than 15', 'error');
        return false;
      }
    }

    if (this.multiple_file_array.length > 0) {
      var total_text_count = 0;
      var total_image_count = 0;
      this.multiple_file_array.forEach(element => {
        if (element.type == 'text_file') {
          total_text_count += 1;
        }
        if (element.type == 'image_file') {
          total_image_count += 1;
        }
      });
      if (total_text_count == 0) {
        this.alertService.showNotification('Please add atleast one event description', 'error');
        this.addEventDescription();
        return false;
      }
      if (total_image_count == 0) {
        this.alertService.showNotification('Please add atleast one image', 'error');
        return false;
      }
    }
    var invalidDesc = false;
    var textCount = 1;
    this.multiple_file_array.forEach((element) => {
      if (element.type == 'text_file') {
        if (element.description.invalid) {
          invalidDesc = true;
          if (element.description.controls.title.invalid) this.alertService.showNotification('Please enter a section title', 'error');
          else this.alertService.showNotification('Please enter section content', 'error');
          var temp = this.completeForm.nativeElement.querySelector('.ng-invalid');
          if (temp) {
            temp.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
            temp.focus();
          }
          return false;
        }
      }
      textCount += 1;
    })
    if (invalidDesc) return false;

    this.markAllAsTouched();
    temp = this.completeForm.nativeElement.querySelector('.ng-invalid');
    var temp2 = this.completeForm.nativeElement.querySelectorAll('.ng-invalid');
    for (var i = 0; i < temp2.length; i++) {
      if((temp2[i].nodeName == 'INPUT') || (temp2[i].nodeName == 'SELECT')){
        temp2[i].scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
        break;
      }
    }

    // [].forEach.call(temp2, (invalid) => {
    //   if(invalid.nodeName == 'INPUT' || invalid.nodeName == 'SELECT'){
    //     invalid.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
    //     console.log('found invalid');
    //     return;
    //   }

    // });
    // if (temp) {

    //   temp.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    //   temp.focus();
    // }

    if (!this.selectedCategory) {
      this.alertService.showNotification('Please select a category', 'error');
      return false;
    }
    if (!this.selectedSubCategoryId) {
      this.alertService.showNotification('Please select a sub-category', 'error');
      return false;
    }

    if (!this.event_start_date && !this.event_start_time) {
      this.alertService.showNotification('Start date & time field is required', 'error');
      return false;
    }

    if (!this.event_end_date && !this.event_end_time) {
      this.alertService.showNotification('End date & time field is required', 'error');
      return false;
    }

    if (this.event_start_date.getTime() >= this.event_end_date.getTime()) {
      $('.focus-endtime').css('border', '1px solid red');
      this.alertService.showNotification('Event end time should be greater than event start time', 'error');
      return false
    }

    if (!this.selectedTimeZoneId) {
      this.alertService.showNotification('Please select timezone for the event', 'error');
      return false;
    }

    if (!this.address_venue) {
      this.alertService.showNotification('Venue field is required', 'error');
      return false;
    }

    if ( (!this.address_line_1 || this.address_line_2) && (this.address_line_1 || !this.address_line_2) && (!this.address_line_1 && !this.address_line_2) ) {
      this.alertService.showNotification('Address line field is required', 'error');
      return false;
    }

    if (!this.address_city) {
      this.alertService.showNotification('City field is required', 'error');
      return false;
    }
    if (!this.address_state) {
      this.alertService.showNotification('State field is required', 'error');
      return false;
    }
    if (!this.address_country) {
      this.alertService.showNotification('Country field is required', 'error');
      return false;
    }
    if (!this.address_pincode) {
      this.alertService.showNotification('Pincode field is required', 'error');
      return false;
    }

    this.tagged_student_id_array.length = 0;
    if (!this.school_id && !this.story_type && !this.story_created_date && !this.user_id) {
      this.alertService.showNotification('Something went wrong, please try again', 'error');
      return false;
    }

    var tformArray = (<FormArray>this.ticketFormMain.controls.ticketFormArray);
    if (tformArray.valid) {
      for (var i = 0; i < tformArray.length; i++) {
        var fg = tformArray.controls[i];
        if (fg.get('ticketStartDate').disabled) continue;
        if (this.combineDateAndTime(fg.get('ticketStartDate').value, fg.get('ticketStartTime').value) >= this.combineDateAndTime(fg.get('ticketEndDate').value, fg.get('ticketEndTime').value)) {
          $('.focus-endtime').css('border', '1px solid red');
          this.alertService.showNotification('End end time should be greater than start time', 'error');
          return false;
        }
      }
    }

    if (this.ticketFormMain.controls.ticketFormArray.invalid) {
      var returnErrorMsg = (index, errorItem) => { return "For ticket #" + index + ", " + errorItem + " field is required " };

      //function to check if the error is from the ticket settings 
      var errorInTicketSetting = (controlName) => {
        var ticketSettingControlNames: Array<string> = ["ticketAddressPincode", "ticketAddressCity", "ticketAddressState", "ticketAddressCountry", "ticketAddressLine1", "ticketAddressVenue", "ticketTimeZone", "ticketEndTime", "ticketEndDate", "ticketStartTime", "ticketStartDate"];
        return ticketSettingControlNames.find((x) => { return x == controlName })
      }

      var controlNameToErrorMsg = (controlName) => {
        switch (controlName) {
          case 'ticketAddressPinCode':
            return 'Pincode of the venue'
          case 'ticketAddressCity':
            return 'City of the venue'
          case 'ticketAddressState':
            return 'State of the venue'
          case 'ticketAddressCountry':
            return 'Country of the venue'
          case 'ticketAddressLine1':
            return 'Address line 1 of the venue'
          case 'ticketAddressVenue':
            return 'Venue'
          case 'ticketTimeZone':
            return 'Time zone'
          case 'ticketStartTime':
            return 'Start time'
          case 'ticketStartDate':
            return 'Start date'
          case 'ticketEndTime':
            return 'End time'
          case 'ticketPurchaseStartDate':
            return 'Start date for purchasing'
          case 'ticketPurchaseStartTime':
            return 'Start time for purchasing'
          case 'ticketPurchaseEndDate':
            return 'End date for purchasing'
          case 'ticketPurchaseEndTime':
            return 'End time for purchasing'
          case 'ticketEndDate':
            return 'End date'
          case 'ticketServiceTax':
            return 'Service tax and payment gateway'
          case 'ticketQty':
            return 'Ticket quantity';
          case 'ticketMinQty':
            return 'Minimum quantity'
          case 'ticketMaxQty':
            return 'Maximum quantity'
          case 'ticketPrice':
            return 'Ticket price'
          case 'ticketName':
            return 'Ticket name'
          default:
            return ""
        }
      }
      var tformArray = (<FormArray>this.ticketFormMain.controls.ticketFormArray);
      for (var i = 0; i < tformArray.length; i++) {
        var fg = tformArray.controls[i];
        //check if the end time is smaller than start time
        var foundInvalControl = Object.keys((<FormGroup>tformArray.controls[i]).controls).every((controlName) => {
          if (fg.get(controlName).invalid) {
            if (errorInTicketSetting(controlName)) this.ticketDisplay[i] = true;
            this.alertService.showNotification(returnErrorMsg(i + 1, controlNameToErrorMsg(controlName)), 'error');
            return false;
          } else return true;
        })
        if (!foundInvalControl) break;
      }
      return false;
    }

    this.parent_children_array.forEach(element => {
      if (this.tagged_student_id_array.indexOf(parseInt(element.id)) == -1) {
        if (element.tagged_status) {
          this.tagged_student_id_array.push(parseInt(element.id));
        }
      }
    });

    this.school_children_array.forEach(element => {
      if (this.tagged_student_id_array.indexOf(parseInt(element.id)) == -1) {
        if (element.tagged_status) {
          this.tagged_student_id_array.push(parseInt(element.id));
        }
      }
    });

    this.school_teacher_array.forEach(element => {
      if (this.tagged_user_id_array.indexOf(parseInt(element.id)) == -1) {
        if (element.tagged_status) {
          this.tagged_user_id_array.push(parseInt(element.id));
        }
      }
    });

    this.learning_tags.forEach(element => {
      if (this.tagged_learning_tags_array.indexOf(parseInt(element.id)) == -1) {
        if (element.tagged_status)
          this.tagged_learning_tags_array.push(parseInt(element.id));
      }
    });
    // this.alertService.showLoader();


    let template = '<div name="story_content" style="background-color:' + this.story_background_color + '">';
    // if (this.eventDescriptionArray && this.eventDescriptionArray.value && Array.isArray(this.eventDescriptionArray.value) && this.eventDescriptionArray.value.length > 0){}
    // this.eventDescriptionArray.value.forEach(text_element => {
    //   var escapedTitle = escape(text_element.title);
    //   var escapedContent = escape(text_element.content);
    //   if (text_element.title && text_element.content) {
    //     // template += '<div name="text">' +'{' + 'title:' + text_element.title + ',content:' + text_element.content +'}'+'</div>';
    //     template += '<div name="text">' + JSON.stringify({ title: escapedTitle, content: escapedContent }) + '</div>';
    //   }
    // });
    this.multiple_file_array.forEach(element => {
      if (element.type == 'text_file' && element.description) {
        var escapedTitle = escape(element.description.value.title);
        var escapedContent = escape(element.description.value.content);
        if (element.description.value.title && element.description.value.content) {
          template += '<div name="text">' + JSON.stringify({ title: escapedTitle, content: escapedContent }) + '</div>';
        }
      } else if (element.type == 'pdf_file') {
        template += '<div name="doc"><embed data-src="' + element.relative_path + '" width="100%" height="500px" type="application/pdf"></embed></div>';
      } else if (element.type == 'image_file') {
        template += '<div name="image"><img data-src="' + element.relative_path + '"/></div>';
      } else if (element.type == 'video_file') {
        template += '<div name="video"><video data-src="' + element.relative_path + '"></video></div>';
      }
    });
    template += '</div>';

    this.alertService.showLoader();

    let time_save_data = {
      "id": this.eventTimeSpanId,
      "utcStart": this.transformDateWithSeconds(this.event_start_date),
      "utcEnd": this.transformDateWithSeconds(this.event_end_date),
      "localStart": this.transformDateWithSeconds(this.event_start_date),
      "localEnd": this.transformDateWithSeconds(this.event_end_date),
      "timeZone": {
        "id": this.selectedTimeZoneId
      },
      "bookingStart": this.transformDateWithSeconds(this.today_date),
      "bookingEnd": this.transformDateWithSeconds(this.event_end_date)
    };


    this.restApiService.putAPI('story/saveDateTimeDuration', time_save_data, (response) => {
      if (response && response.id) {
        this.eventTimeSpanId = response.id;
        let save_address_data = {
          "id": this.eventVeneueId,
          "name": this.address_venue,
          "address": this.address_line_1,
          "addressSecondary": this.address_line_2,
          "state": this.address_state,
          "city": this.address_city,
          "country": this.address_country,
          "lat": this.address_lat,
          "lng": this.address_lng,
          "type": this.address_type,
          "pincode": this.address_pincode
        }
        this.restApiService.putAPI('story/saveAddress', save_address_data, (response) => {
          if (response && response.id) {
            this.eventVeneueId = response.id;
            this.getCapacityIdDetails((response) => {
              if (response) {
                if (this.capacity_id_array.length > 0) {
                  if (this.story_id) {
                    var draft_story_details = this.story_id;
                    if (draft_story_details && draft_story_details) {
                      let update_save_story = {
                        "id": draft_story_details,
                        "schoolId": this.school_id,
                        "userId": this.user_id,
                        // "caption": this.story_caption,
                        "caption": this.default_text_content.value,
                        "text": template,
                        "userCreatedAt": this.transformDate(this.story_created_date),
                        "type": this.story_type,
                        "taggedStudent": this.tagged_student_id_array,
                        "taggedSnaps": [],
                        "associatedTags": this.tagged_learning_tags_array,
                        "capacityIds": this.capacity_id_array,
                        "veneueIds": [this.eventVeneueId],
                        "timeSpan": [this.eventTimeSpanId],
                        "categoryId": this.selectedSubCategoryId,
                        // "chargeTypeId":this.selectedServiceChargeId,
                        "timeZoneId": this.selectedTimeZoneId,
                        "public": this.event_type == 'public' ? "true" : "false"
                      }
                      if (this.role_name == 'ADMIN' && this.story_type == 'ADVERTISEMENT' && this.story_expiry_date) {
                        update_save_story['expireAt'] = this.transformDate(this.story_expiry_date);
                      }
                      this.restApiService.postAPI('story/add', update_save_story, (story_add_response) => {
                        if (story_add_response && story_add_response.id) {
                          this.allowNavigation = true;
                          if (this.tagged_user_id_array && this.tagged_user_id_array.length > 0) {
                            var user_tagged = {
                              "userIds": this.tagged_user_id_array
                            }
                            this.restApiService.postAPI('story/' + story_add_response.id + '/tagUsers', user_tagged, (tagged_user_response) => {
                            });
                          }

                          if (action_type == 'submit' && story_add_response.id) {
                            // if (false) { //this.role_name == 'ADMIN' admins of an organization can only now submit events
                            this.story_id = story_add_response.id;
                            // if (this.edit_story_status != 'PUBLISHED') {
                            //   this.restApiService.postAPI(`story/${story_add_response.id}/state/submit`, {}, (submit_response) => {
                            //     if (submit_response && submit_response['success']) {
                            //       // this.restApiService.postAPI(`story/${story_add_response.id}/state/publish`, {}, (publish_response) => {
                            //       //   if (publish_response && publish_response['success']) {
                            //           this.alertService.showAlertBottomNotification('Event activity published');
                            //           localStorage.removeItem('story_details');
                            //           localStorage.removeItem('story_creation_type_details');
                            //           this.router.navigateByUrl('/activity');
                            //       //   } else {
                            //       //     this.alertService.hideLoader();
                            //       //     this.alertService.showNotification('Something went wrong, please try again', 'error');
                            //       //     return false;
                            //       //   }
                            //       // });
                            //     } else {
                            //       this.alertService.hideLoader();
                            //       this.alertService.showNotification('Something went wrong, please try again', 'error');
                            //       return false;
                            //     }
                            //   });
                            // } else {
                            //   this.alertService.showAlertBottomNotification('Event activity published');
                            //   localStorage.removeItem('story_details');
                            //   localStorage.removeItem('story_creation_type_details');
                            //   this.router.navigateByUrl('/activity');
                            // }
                            // } else {
                            this.restApiService.postAPI(`story/${story_add_response.id}/state/submit`, {}, (submit_response) => {
                              console.log('1 story submit');
                              console.log(submit_response);
                              if (submit_response && submit_response['success']) {
                                this.alertService.showAlertBottomNotification('Event activity submitted, waiting for admin to approve');
                                localStorage.removeItem('story_creation_type_details');
                                localStorage.removeItem('story_details');
                                this.router.navigateByUrl('/stories/pending');
                              } else {
                                this.alertService.hideLoader();
                                this.alertService.showNotification('Something went wrong, please try again', 'error');
                                return false;
                              }
                            });
                            // }
                          } else if (action_type == "preview" && story_add_response.id) {
                            localStorage.removeItem('story_details');
                            localStorage.removeItem('story_creation_type_details');
                            return this.router.navigateByUrl('/activity/preview/' + story_add_response.id);
                          } else {
                            this.alertService.showAlertBottomNotification('Event saved in draft');
                            localStorage.removeItem('story_details');
                            localStorage.removeItem('story_creation_type_details');
                            this.router.navigateByUrl('/stories/draft');
                          }
                        } else {
                          this.alertService.hideLoader();
                          this.alertService.showNotification('Something went wrong, please try again', 'error');
                          return false;
                        }
                      });
                    } else {
                      this.alertService.hideLoader();
                      this.alertService.showNotification('Something went wrong, please try again', 'error');
                      return false;
                    }
                  } else {
                    var status = 'DRAFTED';
                    var save_story = {
                      "schoolId": this.school_id,
                      "userId": this.user_id,
                      // "caption": this.story_caption,
                      "caption": this.default_text_content.value,
                      "text": template,
                      "status": status,
                      "userCreatedAt": this.transformDate(this.story_created_date),
                      "type": this.story_type,
                      "taggedStudent": this.tagged_student_id_array,
                      "taggedSnaps": [],
                      "associatedTags": this.tagged_learning_tags_array,
                      "capacityIds": this.capacity_id_array,
                      "veneueIds": [this.eventVeneueId],
                      "timeSpan": [this.eventTimeSpanId],
                      "categoryId": this.selectedSubCategoryId,
                      // "chargeTypeId":this.selectedServiceChargeId,
                      "timeZoneId": this.selectedTimeZoneId,
                      "public": this.event_type == 'public' ? "true" : "false"
                    }
                    if (this.role_name == 'ADMIN' && this.story_type == 'ADVERTISEMENT' && this.story_expiry_date) {
                      save_story['expireAt'] = this.transformDate(this.story_expiry_date);
                    }

                    this.restApiService.postAPI('story/add', save_story, (first_story_add_response) => {
                      this.allowNavigation = true;
                      if (first_story_add_response && first_story_add_response.id) {
                        if (this.tagged_user_id_array && this.tagged_user_id_array.length > 0) {
                          var user_tagged = {
                            "userIds": this.tagged_user_id_array
                          }
                          this.restApiService.postAPI('story/' + first_story_add_response.id + '/tagUsers', user_tagged, (tagged_user_response) => {
                          });
                        }

                        if (action_type == 'submit' && first_story_add_response.id) {
                          // if (false) { 
                          //   console.log('Got an event submit request');
                          //   this.story_id = first_story_add_response.id;
                          //   this.restApiService.postAPI(`story/${first_story_add_response.id}/state/submit`, {}, (submit_response) => {
                          //     if (submit_response && submit_response['success']) {
                          //       // this.restApiService.postAPI(`story/${first_story_add_response.id}/state/publish`, {}, (publish_response) => {
                          //       //   if (publish_response && publish_response['success']) {
                          //       this.alertService.showAlertBottomNotification("Event submitted");
                          //       localStorage.removeItem('story_details');
                          //       localStorage.removeItem('story_creation_type_details');
                          //       this.router.navigateByUrl('/activity');
                          //       //   } else {
                          //       //     this.alertService.hideLoader();
                          //       //     this.alertService.showNotification('Something went wrong, please try again', 'error');
                          //       //     return false;
                          //       //   }
                          //       // });
                          //     } else {
                          //       this.alertService.hideLoader();
                          //       this.alertService.showNotification('Something went wrong, please try again', 'error');
                          //       return false;
                          //     }
                          //   });
                          // } else {
                            this.restApiService.postAPI(`story/${first_story_add_response.id}/state/submit`, {}, (submit_response) => {
                              if (submit_response && submit_response['success']) {
                                this.alertService.showAlertBottomNotification('Event activity submitted, waiting for admin to approve');
                                localStorage.removeItem('story_details');
                                localStorage.removeItem('story_creation_type_details');
                                this.router.navigateByUrl('/stories/pending');
                              } else {
                                this.alertService.hideLoader();
                                this.alertService.showNotification('Something went wrong, please try again', 'error');
                                return false;
                              }
                            });
                          // }
                        } else if (action_type == "preview" && first_story_add_response.id) {
                          localStorage.removeItem('story_details');
                          localStorage.removeItem('story_creation_type_details');
                          return this.router.navigateByUrl('/story/preview/' + first_story_add_response.id);
                        } else {
                          this.alertService.showAlertBottomNotification('Event saved and drafted');
                          localStorage.removeItem('story_details');
                          localStorage.removeItem('story_creation_type_details');
                          this.router.navigateByUrl('/stories/draft');
                        }
                      } else {
                        this.alertService.hideLoader();
                        this.alertService.showNotification('Something went wrong, please try again', 'error');
                        return false;
                      }
                    });
                  }
                }
              }
            });





          } else {
            this.alertService.hideLoader();
            this.alertService.showNotification('Something went wrong', 'error');
            return false;
          }
        });
      } else {
        this.alertService.hideLoader();
        this.alertService.showNotification('Something went wrong', 'error');
        return false;
      }
    });
  }

  combineDateAndTime(day: Date, time: Date) {
    if ((day instanceof Date) && (time instanceof Date)) return new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
    return null;
  }

  returnTicketTimeId(fg: FormGroup) {
    return new Promise((resolve) => {
      //return the parent event timeSpanId, if the ticket-time is same as event-time 
      if (fg.controls.ticketStartDate.disabled && fg.controls.ticketPurchaseStartDate.disabled) resolve(this.eventTimeSpanId);
      else {
        var element = fg.value;
        var startFinal = this.combineDateAndTime(element.ticketStartDate, element.ticketStartTime);
        var endFinal = this.combineDateAndTime(element.ticketEndDate, element.ticketEndTime);
        var timeZone = element.ticketTimeZone? element.ticketTimeZone : this.selectedTimeZoneId;
        if(fg.controls.ticketStartDate.disabled){
          startFinal = this.event_start_date;
          endFinal = this.event_end_date;
        }else{
          startFinal = element.ticketStartDate;
          endFinal = element.ticketEndDate;    
        } 
        var purchaseStartFinal = ((element.ticketPurchaseStartDate instanceof Date) && (element.ticketPurchaseStartTime instanceof Date)) ?
          this.combineDateAndTime(element.ticketPurchaseStartDate, element.ticketPurchaseStartTime)
          : new Date();
        var purchaseEndFinal
        // purchaseEndFinal = ((element.ticketPurchaseEndDate instanceof Date) && (element.ticketPurchaseEndTime instanceof Date)) ?
        //   this.combineDateAndTime(element.ticketPurchaseEndDate, element.ticketPurchaseEndTime)
        //   : ((element.ticketEndDate instanceof Date) && (element.ticketEndTime instanceof Date))?  this.combineDateAndTime(element.ticketEndDate, element.ticketEndTime): 
        //   this.event_end_date           

        if ((element.ticketPurchaseEndDate instanceof Date) && (element.ticketPurchaseEndTime instanceof Date)) purchaseEndFinal = this.combineDateAndTime(element.ticketPurchaseEndDate, element.ticketPurchaseEndTime);
        else {
          if ((element.ticketEndDate instanceof Date) && (element.ticketEndTime instanceof Date)) purchaseEndFinal = this.combineDateAndTime(element.ticketEndDate, element.ticketEndTime)
          else purchaseEndFinal = this.event_end_date;
        }
        var ticketTimeDetails = {
          "id": element.ticketId,
          "utcStart": this.transformDateWithSeconds(startFinal),
          "utcEnd": this.transformDateWithSeconds(endFinal),
          "localStart": this.transformDateWithSeconds(startFinal),
          "localEnd": this.transformDateWithSeconds(endFinal),
          "bookingStart": this.transformDateWithSeconds(purchaseStartFinal),
          "bookingEnd": this.transformDateWithSeconds(purchaseEndFinal),
          "timeZone": {
            "id": timeZone
          }
        }

        this.restApiService.putAPI('story/saveDateTimeDuration', ticketTimeDetails, (response) => {
          if (response && response.id) resolve(response.id);
          else {
            resolve(false);
          }
        })
      }
    })
  }

  returnTicketAddrId(fg: FormGroup) {
    return new Promise((resolve) => {
      if (fg.controls.ticketAddressLine1.disabled) { resolve(this.eventVeneueId) }
      else {
        var element = fg.value;
        var ticketAddressData = {
          "id": element.ticketAddressId,
          "name": element.ticketAddressVenue,
          "address": element.ticketAddressLine1,
          "addressSecondary": element.ticketAddressLine2,
          "state": element.ticketAddressState,
          "city": element.ticketAddressCity,
          "country": element.ticketAddressCountry,
          "pincode": element.ticketAddressPincode,
          "lat": "",
          "lng": "",
          "type": ""
        }

        this.restApiService.putAPI('story/saveAddress', ticketAddressData, (response) => {
          if (response && response.id) resolve(parseInt(response.id))
          else resolve(false);
        })
      }
    })
  }

  async getCapacityIdDetails(callback) {
    if (this.ticketFormMain.controls && this.ticketFormMain.controls.ticketFormArray && this.ticketFormMain.controls.ticketFormArray.value && Array.isArray(this.ticketFormMain.controls.ticketFormArray.value) && this.ticketFormMain.controls.ticketFormArray.value.length > 0) {
      this.capacity_id_array = [];

      // (<FormArray>this.ticketFormMain.controls.ticketFormArray).controls.forEach((control: FormGroup) => {
      for (var control of (<FormGroup[]>(<FormArray>this.ticketFormMain.controls.ticketFormArray).controls)) {
        var element = control.value;
        var ticketId = await this.returnTicketTimeId(control).then((id) => { return id; });
        if (ticketId) control.get('ticketTimeId').patchValue(ticketId);
        else {
          this.alertService.hideLoader();
          this.alertService.showNotification('Something went wrong, please try again', 'error');
          return false;
        }

        var ticketAddressId = await this.returnTicketAddrId(control);
        if (ticketAddressId) control.controls.ticketAddressId.patchValue(ticketAddressId);
        else {
          this.alertService.hideLoader();
          this.alertService.showNotification('Something went wrong, please try again', 'error');
          return false;
        }

        element = control.value;
        var capacityData = {
          "name": element.ticketName,
          "id": element.ticketCapacityId ? element.ticketCapacityId : null,
          "capacityLimit": element.ticketQty,
          "capacityRemains": element.ticketQty,
          "ticketPrice": element.ticketPrice ? element.ticketPrice : 0,
          "currency": "INR",
          "minPurchase": element.ticketMinQty,
          "maxPurchase": element.ticketMaxQty,
          "serviceCharge": {
            "id": element.ticketServiceTax ? element.ticketServiceTax : 101
          },
          "status": control.get('ticketType').value, //element.ticketType,
          "duration": {
            "id": element.ticketTimeId
          },
          "veneue": {
            "id": element.ticketAddressId
          }
        }
        //add capacityId if it is available(if this is an edited story)


        this.restApiService.postAPI('capacity/add', capacityData, (capacity_add_response) => {
          if (capacity_add_response && capacity_add_response.id) {
            var check_index = this.capacity_id_array.findIndex((capacity_id) => { return capacity_id == capacity_add_response.id });
            if (check_index == -1) {
              this.capacity_id_array.push(capacity_add_response.id);
            }
            if (this.capacity_id_array.length == this.ticketFormMain.controls.ticketFormArray.value.length) {
              return callback && callback(true);
            }
          }
          else{
            this.alertService.hideLoader();
            this.alertService.showNotification(capacity_add_response.message, 'error');
          }
        });

      }




      // if (element) {
      //   let ticket_data = {
      //     "name": element.ticketName,
      //     "capacityLimit": element.ticketQty,
      //     "capacityRemains": element.ticketQty,
      //     "ticketPrice": element.ticketPrice ? element.ticketPrice : 0,
      //     "currency": "INR",
      //     "minPurchase": element.ticketMinQty,
      //     "maxPurchase": element.ticketMaxQty,
      //     "serviceCharge": {
      //       "id": element.ticketServiceTax ? element.ticketServiceTax : 101
      //     },
      //     "status": element.ticketType,
      //     "duration": {
      //       "id": element.ticketTimeId
      //     },
      //     "veneue": {
      //       "id": element.ticketAddressId
      //     }
      //   }
      //   this.restApiService.postAPI('capacity/add', ticket_data, (capacity_add_response) => {
      //     if (capacity_add_response && capacity_add_response.id) {
      //       var check_index = this.capacity_id_array.findIndex((capacity_id) => { return capacity_id == capacity_add_response.id });
      //       if (check_index == -1) {
      //         this.capacity_id_array.push(capacity_add_response.id);
      //       }
      //       if (this.capacity_id_array.length == this.ticketFormMain.controls.ticketFormArray.value.length) {
      //         return callback && callback(true);
      //       }
      //     }
      //   });
      // }
    };
  }


  /* Date Pipe to change format*/
  transformDate(date) {
    var newDate = new Date(date);
    return this.datePipe.transform(newDate, "yyyy-MM-dd"); //whatever format you need. 
  }


  /* Date Pipe to change format*/
  transformDateWithSeconds(date) {
    return this.datePipe.transform(date, "yyyy-MM-dd HH:mm:ss.SSS"); //whatever format you need. 
  }

  /* Date Pipe to change to specific format */
  transformDateViewFormat(date) {
    date = new Date(date);
    return this.datePipe.transform(date, "dd/MM/yyyy"); //whatever format you need. 
  }

  /*
  * Function to upload image, video, pdf based on action type
  */
  openCameraModal(index_value, action_type) {
    $('#camera_image_modal').show();
    this.openCamera(index_value, action_type);
  }

  /*
  * Function to upload image, video, pdf based on action type
  */
  openCamera(index_value, action_type) {
    this.click_element_type_array.length = 0;
    this.click_element_type_array.push({ index_value: index_value, action_type: action_type })
    this.showCameraStatus = !this.showCameraStatus;
  }

  closeCamera(event) {
    if (event) {
      this.showCameraStatus = false;
      $('#camera_image_modal').hide();
    }
  }

  /* 
  * Capture image
  */
  captureImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
    if (this.webcamImage) {
      let camera_image = this.getBlobImageFile(this.webcamImage.imageAsDataUrl);
      if (camera_image && camera_image instanceof File) {
        if (this.click_element_type_array.length == 1) {
          this.click_element_type_array.forEach(element => {
            if (element.action_type && element.action_type == 'camera') {
              element.action_type = 'image';
              if (this.checkFileExtenstion(camera_image, element.action_type)) {
                let reader = new FileReader();
                reader.onload = (e: any) => {
                  if (element.action_type == 'image') {
                    this.multiple_file_array.push({ type: 'image_file', image_src: e.target.result, upload_type: false, index_value: element.index_value, count: 1 });
                  }
                  this.saveToDb(camera_image, element.action_type, element.index_value, 1, e.target.result);
                  this.showCameraStatus = false;
                  $('#camera_image_modal').hide();
                  if (document.getElementById('panel_' + element.index_value))
                    document.getElementById('panel_' + element.index_value).style.display = 'none';
                }
                reader.readAsDataURL(camera_image);
              } else {
                this.alertService.showNotification('Something went wrong, please try again', 'error');
                return false;
              }
            } else {
              this.alertService.showNotification('Something went wrong, please try again', 'error');
              return false;
            }
          });
        }
      } else {
        this.alertService.showNotification('Something went wrong, please try again', 'error');
        return false;
      }
    } else {
      this.alertService.showNotification('Something went wrong, please try again', 'error');
      return false;
    }
  }

  /*
  * Function to get orientation of image
  */
  getOrientation(file, callback) {
    var reader: any,
      target: EventTarget;
    reader = new FileReader();
    reader.onload = (event) => {
      var view = new DataView(event.target.result);
      if (view.getUint16(0, false) != 0xFFD8) return callback(-2);

      var length = view.byteLength, offset = 2;
      while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;

        if (marker == 0xFFE1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) {
            return callback(-1);
          }
          var little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;

          for (var i = 0; i < tags; i++)
            if (view.getUint16(offset + (i * 12), little) == 0x0112)
              return callback(view.getUint16(offset + (i * 12) + 8, little));
        }
        else if ((marker & 0xFF00) != 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      return callback(-1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  }

  /*
  * Function to return base64 image
  */
  getBase64(file, orientation) {
    var reader = new FileReader();
    reader.onload = () => {
      var base64 = reader.result;
      this.resetOrientation(base64, orientation, (resetBase64Image) => {
        return resetBase64Image;
      });
    };
    reader.readAsDataURL(file);
    reader.onerror = (error) => {
    };
  }

  /*
  * Function to reset orientation
  */
  resetOrientation(srcBase64, srcOrientation, callback) {
    var img = new Image();
    img.onload = () => {
      var width = img.width,
        height = img.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d");
      // set proper canvas dimensions before transform & export
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
      // transform context before drawing image
      switch (srcOrientation) {
        case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, height, width); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
        default: break;
      }
      // draw image
      ctx.drawImage(img, 0, 0);
      // export base64
      return callback && callback(canvas.toDataURL());
    };
    img.src = srcBase64;
  }

  /*
  * Function to convert base64 to blob and blob to file
  */
  getBlobImageFile(base64_img_path) {
    if (this.checkImageIsDataURL(base64_img_path)) {
      var ImageURL = base64_img_path;
      // Split the base64 string in data and contentType
      var block = ImageURL.split(";");
      // Get the content type
      var contentType = block[0].split(":")[1];// In this case "image/gif"
      // get the real base64 content of the file
      var realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."
      // Convert to blob
      var blob = this.convertBase64toBlob(realData, contentType);
      // Create a FormData and append the file
      var image_file: any = false;
      if (blob)
        image_file = this.convertBlobToImageFile(blob, contentType);

      return image_file;
    } else {
      this.alertService.showNotification('Something went wrong, please try again', 'error');
      return false;
    }
  }

  /*
  * Check image URL is base64 data URL
  */
  checkImageIsDataURL(s) {
    var isDataURL_regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
    return !!s.match(isDataURL_regex);
  }

  /*
  * Function to convert base64 image to blob
  */
  convertBase64toBlob(b64Data, contentType) {
    try {
      var contentType = contentType || '';
      var sliceSize = 512;
      var byteCharacters = atob(b64Data);
      var byteArrays = [];
      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      var blob = new Blob(byteArrays, { type: contentType });
      return blob;
    } catch (e) { }
  }

  /*
  * Check image URL is base64 data URL
  */
  convertBlobToImageFile(blob, contentType) {
    const date = new Date().valueOf();
    let text = '';
    const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(Math.floor(Math.random() * possibleText.length));
    }
    var extension = 'jpeg';
    if (contentType) {
      extension = contentType.split('/')[1];
    }
    const imageName = text + '_' + date + '.' + extension;
    const imageFile = new File([blob], imageName, { type: contentType });
    return imageFile;
  }

  /*
  * Generating canvas Image
  */
  getCanvasImageDetails(id, relative_path) {
    this.canvas_relative_path = relative_path;
    let element: Element = document.getElementById(id) as HTMLElement;
    if (this.canvas) {
      this.ctx = this.canvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
      if (this.ctx) {
        this.ctx.clearRect(0, 0, 600, 400);
        this.canvas_generated_image = document.createElement("img");
        this.canvas_generated_image.setAttribute('crossOrigin', 'Anonymous');
        this.canvas_generated_image.src = element.getAttribute('src');
        this.canvas_generated_image.id = "canvas_image";
        this.canvas_generated_image.onload = () => {
          this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
          this.canvas_width = this.canvas_generated_image.width;
          this.canvas_height = this.canvas_generated_image.height;
          this.ctx.save();
          this.ctx.drawImage(this.canvas_generated_image, 0, 0);
          this.ctx.restore();
          setTimeout(() => {
            this.resetCanvasToOriginal();
          }, 1);
          this.rotated_canvas_generated_image_src = this.getImagePath();
          this.rotated_canvas_generated_image_status = true;
        }
      }
    }
  }

  showImageRotateModalPopup(id, relative_path) {
    $('#edit_image_modal').modal('show');
    this.getCanvasImageDetails(id, relative_path)
  }

  closepopupImage() {
    $('#edit_image_modal').modal('hide');
  }

  /*
  * Function to rotate canvas image clock wise
  */
  clockwise() {
    this.angleInDegrees = (this.angleInDegrees + 90) % 360;
    this.drawRotated(this.angleInDegrees);
  }

  /*
  * Function to rotate canvas image counter clock wise
  */
  counterclockwise() {
    if (this.angleInDegrees == 0) {
      this.angleInDegrees = 270;
    } else {
      this.angleInDegrees = (this.angleInDegrees - 90) % 360;
    }
    this.drawRotated(this.angleInDegrees);
  }

  /*
  * Function to save snap with some modification(Rotate)
  */
  saveImage() {
    let base64_img_path = this.getImagePath();
    if (base64_img_path) {
      let file_data = this.getBlobImageFile(base64_img_path);
      if (file_data && this.canvas_relative_path && this.school_id && this.user_id) {
        // this.alertService.showLoader();
        this.awsImageuploadService.uploadFileToAWS(file_data, 'story/' + this.school_id, 0, (aws_image_upload_response) => {
          if (aws_image_upload_response && aws_image_upload_response.Location && aws_image_upload_response.key) {
            var check_id = this.multiple_file_array.filter((snap) => { return snap.relative_path == this.canvas_relative_path && snap.type == 'image_file' });
            if (check_id && check_id.length > 0 && Array.isArray(check_id)) {
              this.awsImageuploadService.deleteFile(this.canvas_relative_path, () => { });
              check_id.forEach(element => {
                element.image_src = '';
                setTimeout(() => {
                  element.image_src = AWS_DEFAULT_LINK + aws_image_upload_response.key;
                  element.relative_path = aws_image_upload_response.key;
                }, 1);
                this.clearCanvas();
                this.ctx = null;
                this.canvas_generated_image = null;
                this.rotated_canvas_generated_image_status = false;
                $('#edit_image_modal').modal('hide');
              });
            }
          } else {
            this.alertService.showNotification('Something went wrong, please try again', 'error');
          }
          this.alertService.hideLoader();
        });
      }
    }
  }

  /*
  * Function to rotate canvas image (clockwise and counter clockwise)
  */
  drawRotated(degrees) {
    if (this.canvas && this.ctx) {
      if (degrees == 90 || degrees == 270) {
        this.canvas.nativeElement.width = this.canvas_generated_image.height;
        this.canvas.nativeElement.height = this.canvas_generated_image.width;
      } else {
        this.canvas.nativeElement.width = this.canvas_generated_image.width;
        this.canvas.nativeElement.height = this.canvas_generated_image.height;
      }
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      if (degrees == 90 || degrees == 270) {
        this.ctx.translate(this.canvas_generated_image.height / 2, this.canvas_generated_image.width / 2);
      } else {
        this.ctx.translate(this.canvas_generated_image.width / 2, this.canvas_generated_image.height / 2);
      }
      this.ctx.rotate(degrees * Math.PI / 180);
      this.ctx.drawImage(this.canvas_generated_image, -(this.canvas_generated_image.width / 2), -(this.canvas_generated_image.height / 2));
      this.rotated_canvas_generated_image_src = this.getImagePath();
      this.rotated_canvas_generated_image_status = true;
    }
  }

  /*
  * Function to return image path
  */
  getImagePath() {
    if (this.canvas && this.ctx) {
      return this.canvas.nativeElement.toDataURL('image/jpeg', 100);
    }
    return null;
  }

  /*
  * Function to return image path
  */
  clearCanvas() {
    if (this.canvas && this.ctx) {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.canvas.nativeElement.width = 600;
      this.canvas.nativeElement.height = 400;
      this.ctx.restore();
    }
  }

  /*
  * Function to flip canvas image (mirror image)
  */
  flipCanvas() {
    if (this.canvas && this.ctx) {
      this.canvas.nativeElement.width = this.canvas_generated_image.width;
      this.canvas.nativeElement.height = this.canvas_generated_image.height;
      this.ctx.clearRect(0, 0, this.canvas_generated_image.width, this.canvas_generated_image.height);
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, -1, 0, this.canvas.nativeElement.height);
      this.ctx.translate(this.canvas_generated_image.width - 1, this.canvas_generated_image.height - 1);
      this.ctx.rotate(Math.PI);
      this.ctx.drawImage(this.canvas_generated_image, 0, 0, this.canvas_generated_image.width, this.canvas_generated_image.height);
      this.ctx.restore();
      this.rotated_canvas_generated_image_src = this.getImagePath();
    }
  }

  /*
  * Function to reset to original image
  */
  resetCanvasToOriginal() {
    if (this.canvas && this.ctx) {
      this.canvas.nativeElement.width = this.canvas_generated_image.width;
      this.canvas.nativeElement.height = this.canvas_generated_image.height;
      this.ctx.clearRect(0, 0, this.canvas_generated_image.width, this.canvas_generated_image.height);
      this.ctx.save();
      this.ctx.drawImage(this.canvas_generated_image, 0, 0, this.canvas_generated_image.width, this.canvas_generated_image.height);
      this.ctx.restore();
      this.rotated_canvas_generated_image_src = this.getImagePath();
    }
  }

  /*
  * Function to background picker color
  */
  openColorPicker() {
    $('#picker_background_color').toggle();
  }

  /*
  * Function to background picker color
  */
  pickColor(color) {
    if (color)
      this.story_background_color = color;
  }


  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event) {
    this.helperService.updateDefaultImageUrlHelper(event);
  }

  // autofill address
  address_pincode: string;
  address_country: string;
  address_state: string;
  address_city: string;
  address_venue: string;
  address_line_1: string;
  address_line_2: string;
  address_type: string;
  address_options = {
    componentRestrictions: { country: 'IN' }
  }
  address_lat: number;
  address_lng: number;

  public handleAddressChange(address: any) {
    if (address) {
      this.address_pincode = '';
      this.address_country = '';
      this.address_state = '';
      this.address_city = '';
      this.address_venue = '';
      this.address_line_1 = '';
      this.address_line_2 = '';

      if (address.name) {
        this.address_venue = address.name;
      }
      if (address.types && Array.isArray(address.types) && address.types.length > 0) {
        address.types.forEach((element, key) => {
          if (key == 0) {
            this.address_type = element;
          }
        });
      }

      if (address.geometry && address.geometry.location && address.geometry.location.lat() && address.geometry.location.lng()) {
        this.address_lat = address.geometry.location.lat();
        this.address_lng = address.geometry.location.lng();
      }
      address.address_components.forEach(element => {
        if (element && element.types && Array.isArray(element.types) && element.types.length > 0) {
          element.types.forEach(types_element => {
            if (types_element == "postal_code") {
              this.address_pincode = element.long_name;
            } else if (types_element == "country") {
              this.address_country = element.long_name;
            } else if (types_element == "administrative_area_level_1") {
              this.address_state = element.long_name;
            } else if (types_element == "locality") {
              this.address_city = element.long_name;
            } else if (types_element == "route" || types_element == "neighborhood" || types_element == "sublocality_level_3") {
              this.address_line_1 += element.long_name + ",";
            } else if (types_element == "sublocality_level_2" || types_element == "sublocality_level_1") {
              this.address_line_2 += element.long_name + ",";
            }
          });
        }
      });
    }
  }

  resetGeoCord() {
    console.log("address just changed");
  }


  addDefaultImageToStory(id) {
    if (id) {
      let element: Element = document.getElementById(id) as HTMLElement;
      if (this.canvas) {
        this.ctx = this.canvas.nativeElement.getContext("2d") as CanvasRenderingContext2D;
        if (this.ctx) {
          this.ctx.clearRect(0, 0, 600, 400);
          this.canvas_generated_image = document.createElement("img");
          this.canvas_generated_image.setAttribute('crossOrigin', 'Anonymous');
          this.canvas_generated_image.src = element.getAttribute('src');
          this.canvas_generated_image.id = "canvas_image";
          this.canvas_generated_image.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
            this.canvas_width = this.canvas_generated_image.width
            this.canvas_height = this.canvas_generated_image.height;
            this.ctx.save();
            this.ctx.drawImage(this.canvas_generated_image, 0, 0);
            this.ctx.restore();
            // setTimeout(() => {
            //   this.resetCanvasToOriginal();
            // }, 1);
            this.resetCanvasToOriginal();
            this.saveDefaultImageToStory();
            //   this.rotated_canvas_generated_image_src=this.getImagePath();
            //   // this.rotated_canvas_generated_image_status = true;
          }
        }
      }
    }
  }


  saveDefaultImageToStory() {
    let base64_img_path = this.getImagePath();
    if (base64_img_path) {
      let file_data = this.getBlobImageFile(base64_img_path);
      if (!file_data && !this.school_id && !this.user_id) {
        this.alertService.showNotification('Something went wrong, Please try again', 'error');
        return false;
      }
      var index_value = 'first', count = 1;

      this.multiple_file_array.splice(this.multiple_file_array.length, 0, { type: 'image_file', image_src: base64_img_path, upload_type: false, index_value: index_value, count: count });
      this.awsImageuploadService.uploadFileToAWS(file_data, 'story/' + this.school_id, 0, (aws_image_upload_response) => {
        if (aws_image_upload_response && aws_image_upload_response.Location && aws_image_upload_response.key) {
          // this.multiple_file_array.splice(this.multiple_file_array.length,0,{type:'image_file',image_src:base64_img_path,upload_type:true, index_value:0, count:0, relative_path: aws_image_upload_response.key});
          var check_id_index = this.multiple_file_array.findIndex((snap) => { return snap.index_value == index_value && !snap.id && !snap.upload_type && snap.count == count && snap.type == 'image_file' });
          if (check_id_index > -1) {
            this.multiple_file_array[check_id_index].type = 'image_file';
            this.multiple_file_array[check_id_index].image_src = base64_img_path;
            this.multiple_file_array[check_id_index].upload_type = true;
            this.multiple_file_array[check_id_index].index_value = 0;
            this.multiple_file_array[check_id_index].count = 0;
            this.multiple_file_array[check_id_index].relative_path = aws_image_upload_response.key;
          }
        }
      });
      this.makeScroll('image');
    }
  }

  //funtions for category and subcategory selection functionality
  //function to get data from the api and store it to 'categoriesApiData' array
  getCategoryDetails() {
    if (this.categoriesApiData.length > 0)
      this.categories = [];
    this.renderer.setStyle(this.categoryLoader.nativeElement, 'display', 'block');
    this.restApiService.getData('story/category', (response) => {
      if (response && Array.isArray(response) && response.length > 0) {
        this.categoriesApiData = response;
        this.categoriesApiData.forEach((item) => {
          if (!this.categories.find((catItem) => { return item.name == catItem.name })) {
            var matchingCatIcon = '';
            if (this.categoryIcons.find((cat) => { return cat.category == item.name })) matchingCatIcon = this.categoryIcons.find((cat) => { return cat.category == item.name }).icon;
            // else matchingCatIcon = "could not find";
            this.categories.push({ name: item.name, icon: matchingCatIcon });
          }
        });
      }
      this.renderer.setStyle(this.categoryLoader.nativeElement, 'display', 'none');

    }, () => { this.renderer.setStyle(this.categoryLoader.nativeElement, 'display', 'none'); });

  }


  //funtion called when user makes a categroy selection
  onSelectCategory(category: string, changeSubCat: boolean = false) {
    if (!changeSubCat) this.selectedSubCategory = null;
    this.selectedCategory = category;
    this.subCategories = [];
    this.categoriesApiData.forEach(item => {
      if (item.name == category) {
        this.subCategories.push({ id: item.id, subName: item.subName });
      }
    });
    setTimeout(() => {
      document.getElementById('subcatDropdown').classList.add('open')
    }, 1);
  };

  // onSelectCategory(category: string) {
  //   this.selectedCategory = category;
  //   this.subCategories = [];
  //   this.categoriesApiData.forEach(item => {
  //     if (item.name == category) this.subCategories.push(item.subName);
  //   });
  //   this.selectedSubCategory = "";
  //   this.subcategoryDdRef.show();
  //   document.getElementById("subCategory").focus();
  //   // this.filteredsubCategories = [...this.subCategories];
  // };

  handleSubCat(category: string = null) {
    if (!category) this.alertService.showNotification('Please select a category first', 'error');
    if (Array.isArray(this.subCategories) && this.subCategories.length > 0) { return };

    this.getCategoryDetails();
    this.onSelectCategory(category, true);
  }

  //funtion called when user makes a subCategroy selection
  onSelectSubcat(subCategory: string, subCategoryId: number) {
    this.selectedSubCategory = subCategory;
    this.selectedSubCategoryId = subCategoryId;
  }

  //called when the user types in the subcategroy inputbox
  // filterSubCats() {
  //   this.filteredsubCategories = this.subCategories.filter((subcats => { return subcats.toLowerCase().includes(this.selectedSubCategory.toLowerCase()) }));
  // }

  //function to hide the subcategory selection
  // handleOutsideClick(event: any) {
  //   // check that the target element is not the category selector or the subcategory selector
  //   if (this.subcategoryDdRef.isOpen && !(event.target.classList.contains("categoryInput") || event.target.id == "subCategory")) {
  //     this.subcategoryDdRef.hide();
  //   }
  // }

  timezone_array = new Array();
  getTimezones() {
    this.timezone_array = [];
    this.restApiService.getData('story/supported_time_zones', (response) => {
      if (response && Array.isArray(response) && response.length > 0) {
        this.timezone_array = response;       
      }
    });
  }

  selectedTimeZoneId: number = 100;
  onChangeSelectTimeZone(event) {
    this.selectedTimeZoneId = event;
  }

  ticketCounting = new Array(1);

  /* ///////////////////////////////
    functions for ticket handling
    //////////////////////////////// */

  returnNewTicket(): FormGroup {
    const formgroup = new FormGroup({
      ticketCapacityId: new FormControl(null),
      ticketTimeId: new FormControl(0),
      ticketAddressId: new FormControl(0),
      ticketType: new FormControl('PAID'),
      ticketName: new FormControl(null, Validators.required),
      ticketServiceTax: new FormControl(0, Validators.required),
      ticketQty: new FormControl(null, [Validators.required, Validators.min(1)]),
      ticketMinQty: new FormControl(1, Validators.required),
      ticketMaxQty: new FormControl(null, Validators.required),
      ticketPrice: new FormControl(null, [Validators.required, Validators.min(1)]),
      ticketStartDate: new FormControl(null, Validators.required),
      ticketStartTime: new FormControl(null, Validators.required),
      ticketEndDate: new FormControl(null, Validators.required),
      ticketEndTime: new FormControl(null, Validators.required),
      ticketPurchaseStartDate: new FormControl(null),
      ticketPurchaseStartTime: new FormControl(null),
      ticketPurchaseEndDate: new FormControl(null),
      ticketPurchaseEndTime: new FormControl(null),
      ticketTimeZone: new FormControl(100),
      ticketAddressVenue: new FormControl(null, Validators.required),
      ticketAddressLine1: new FormControl(null),
      ticketAddressLine2: new FormControl(null),
      ticketAddressCountry: new FormControl(null, Validators.required),
      ticketAddressState: new FormControl(null, Validators.required),
      ticketAddressCity: new FormControl(null, Validators.required),
      ticketAddressPincode: new FormControl(null, Validators.required),
    });
    formgroup.get('ticketServiceTax').setValidators([this.ticketServiceTaxValidator('string')]);
    formgroup.get('ticketPrice').setValidators([this.ticketPriceValidator('string')]);
    formgroup.get('ticketMaxQty').setValidators([this.maxQtyValidator('string')]);
    formgroup.get('ticketPurchaseStartDate').disable();
    formgroup.get('ticketPurchaseStartTime').disable();
    formgroup.get('ticketPurchaseEndDate').disable();
    formgroup.get('ticketPurchaseEndTime').disable();

    return formgroup;
  }

  assignTicketDetails(details, isEventPublished) {
    if (details && Array.isArray(details) && details.length > 0) {
      this.ticketFormMain = new FormGroup({
        ticketFormArray: new FormArray([])
      });
      var ticket_details = [];
      details.forEach((ticket_element, index) => {
        if (ticket_element && ticket_element.id) {
          //adding the first formGroup
          var patchValue = {
            ticketCapacityId: ticket_element.id,
            ticketTimeId: ticket_element.duration.id,
            ticketAddressId: ticket_element.veneue.id,
            ticketType: ticket_element.status,
            ticketName: ticket_element.name,
            ticketServiceTax: ticket_element.serviceCharge.id,
            ticketQty: ticket_element.capacityLimit,
            ticketMinQty: ticket_element.minPurchase,
            ticketMaxQty: ticket_element.maxPurchase,
            ticketPrice: ticket_element.ticketPrice,
            ticketStartDate: new Date(ticket_element.duration.utcStart),
            ticketStartTime: new Date(ticket_element.duration.utcStart),
            ticketEndDate: new Date(ticket_element.duration.utcEnd),
            ticketEndTime: new Date(ticket_element.duration.utcEnd),
            ticketPurcahseStartDate: new Date(ticket_element.duration.bookingStart),
            ticketPurcahseStartTime: new Date(ticket_element.duration.bookingStart),
            ticketPurcahseEndDate: new Date(ticket_element.duration.bookingEnd),
            ticketPurcahseEndTime: new Date(ticket_element.duration.bookingEnd),
            ticketTimeZone: ticket_element.duration.timeZone.id,
            ticketAddressVenue: ticket_element.veneue.name,
            ticketAddressLine1: ticket_element.veneue.address,
            ticketAddressLine2: ticket_element.veneue.addressSecondary,
            ticketAddressCountry: ticket_element.veneue.country,
            ticketAddressState: ticket_element.veneue.state,
            ticketAddressCity: ticket_element.veneue.city,
            ticketAddressPincode: ticket_element.veneue.pincode,
          }
          var newFormGroup = this.returnNewTicket();
          newFormGroup.patchValue(patchValue);
          if (isEventPublished) newFormGroup.get('ticketType').disable();
          (<FormArray>this.ticketFormMain.controls.ticketFormArray).push(newFormGroup);
          this.ticketDisplay.push(false);
          if (ticket_element.duration.id == this.eventTimeSpanId) this.makeDefault(true, index, 'timings');
          else{
            //if we have a different duration id
            if((patchValue.ticketStartDate.getTime() == this.event_start_date.getTime()) && (patchValue.ticketEndDate.getTime() == this.event_end_date.getTime())){
              this.makeDefault(true, index, 'timings')
            }
              console.log('this is the ticketPurchaseDate');
              console.log(newFormGroup.get('ticketPurchaseStartDate'));
              newFormGroup.get('ticketPurchaseStartDate').enable();
              newFormGroup.get('ticketPurchaseStartDate').patchValue(new Date(ticket_element.duration.bookingStart));
              newFormGroup.get('ticketPurchaseStartTime').enable();
              newFormGroup.get('ticketPurchaseStartTime').patchValue(new Date(ticket_element.duration.bookingStart));
              newFormGroup.get('ticketPurchaseEndDate').enable();
              newFormGroup.get('ticketPurchaseEndDate').patchValue(new Date(ticket_element.duration.bookingEnd));
              newFormGroup.get('ticketPurchaseEndTime').enable();
              newFormGroup.get('ticketPurchaseEndTime').patchValue(new Date(ticket_element.duration.bookingEnd));
          }
          if (ticket_element.veneue.id == this.eventVeneueId) this.makeDefault(true, index, 'venue');
        }
      });

      this.closeAllTicketSettings();
    }
  }


  //called when user clicks on the 'add ticket' button
  addNewTicket() {
    var ticketRef = this.returnNewTicket();
    (<FormArray>this.ticketFormMain.get('ticketFormArray')).push(ticketRef);
    //initially setting display of ticket setting to 'off'
    this.ticketDisplay.push(false);
    this.closeAllTicketSettings();
    return ticketRef;
  }


  //payment-tax
  service_tax_details_array = new Array();
  getServiceTaxDetails() {
    this.service_tax_details_array = [];
    this.restApiService.getData('story/supported_service_charge_rules', (response) => {
      if (response && Array.isArray(response) && response.length > 0) {
        this.service_tax_details_array = response;
      }
    })
  }

  makeDefault(checked: boolean, i: number, type: string) {

    var form = (<FormGroup>(<FormArray>this.ticketFormMain.get('ticketFormArray')).controls[i]);
    console.log("finding ticketForm At index: " + i);
    if (checked) {
      if (type == 'timings') {
        form.get('ticketTimeId').patchValue(this.eventTimeSpanId);
        form.get('ticketStartDate').disable({ onlySelf: true });
        form.get('ticketStartTime').disable({ onlySelf: true });
        form.get('ticketEndDate').disable({ onlySelf: true });
        form.get('ticketEndTime').disable({ onlySelf: true });
        form.get('ticketTimeZone').disable({ onlySelf: true });
        form.updateValueAndValidity();
        return;
      }
      if (type == 'venue') {
        form.get('ticketAddressId').patchValue(this.eventVeneueId);
        form.get('ticketAddressVenue').disable({ onlySelf: true });
        form.get('ticketAddressLine1').disable({ onlySelf: true });
        form.get('ticketAddressLine2').disable({ onlySelf: true });
        form.get('ticketAddressCountry').disable({ onlySelf: true });
        form.get('ticketAddressState').disable({ onlySelf: true });
        form.get('ticketAddressCity').disable({ onlySelf: true });
        form.get('ticketAddressPincode').disable({ onlySelf: true });
        form.updateValueAndValidity();
      }
    } else {
      if (type == 'timings') {
        form.get('ticketTimeId').patchValue(0);
        form.get('ticketStartDate').enable({ onlySelf: true });
        form.get('ticketStartTime').enable({ onlySelf: true });
        form.get('ticketEndDate').enable({ onlySelf: true });
        form.get('ticketEndTime').enable({ onlySelf: true });
        form.get('ticketTimeZone').enable({ onlySelf: true });
        return;
      }
      if (type == 'venue') {
        form.get('ticketAddressId').patchValue(0);
        form.get('ticketAddressVenue').enable({ onlySelf: true });
        form.get('ticketAddressLine1').enable({ onlySelf: true });
        form.get('ticketAddressLine2').enable({ onlySelf: true });
        form.get('ticketAddressCountry').enable({ onlySelf: true });
        form.get('ticketAddressState').enable({ onlySelf: true });
        form.get('ticketAddressCity').enable({ onlySelf: true });
        form.get('ticketAddressPincode').enable({ onlySelf: true });
      }

    }


    var currentValues = {
      ticketStartDate: this.event_start_date,
      ticketStartTime: this.event_start_time,
      ticketEndDate: this.event_end_date,
      ticketEndTime: this.event_end_time,
      ticketTimeZone: this.selectedTimeZoneId,
      ticketAddressPincode: this.address_pincode,
      ticketAddressCountry: this.address_country,
      ticketAddressState: this.address_state,
      ticketAddressCity: this.address_city,
      ticketAddressVenue: this.address_venue,
      ticketAddressLine1: this.address_line_1,
      ticketAddressLine2: this.address_line_2
    }


  }

  onChangeDatePickerEventStartDate(event: Date) {

    setTimeout(() => {
      this.event_start_date.setHours(9, 0, 0, 0);
      // this.event_end_time = new Date();
      // this.event_end_time

      this.event_start_date = new Date(this.event_start_date.getTime());
      if (this.event_end_date) {
        if (this.event_end_date.getTime() < this.event_start_date.getTime()) this.event_end_date = new Date(this.event_start_date.getTime())
      }
    }, 100);
    //TODO reset ticket start date and end date based on the event start date    

  }


  onChangeDatePickerEventEndDate(event: Date) {
    // setTimeout(() => {
    //   this.event_end_date.setHours(9,0,0,0);
    //   // this.event_end_time = new Date();
    //   // this.event_end_time

    //   this.event_start_date = new Date(this.event_start_date.getTime());
    //   if (this.event_end_date) {
    //     if (this.event_end_date.getTime() < this.event_start_date.getTime()) this.event_end_date = new Date(this.event_start_date.getTime())
    //   }
    //   console.log('printing current date');
    //   console.log(this.event_start_date);
    // }, 100);
    // this.event_end_date = event;
    // console.log(this.event_end_date);
    event.setHours(17, 0, 0, 0);
    this.event_end_date = event;
  }

  onChangeDatePickerTicketEventStartdDate(event: Date, index) {

    // if (this.ticketFormMain && this.ticketFormMain.controls && this.ticketFormMain.controls.ticketFormArray && this.ticketFormMain.controls.ticketFormArray.value && Array.isArray(this.ticketFormMain.controls.ticketFormArray.value) && this.ticketFormMain.controls.ticketFormArray.value.length > 0) {
    //   this.ticketFormMain.controls.ticketFormArray.value.forEach((element, key) => {
    //     if (element && element.ticketStartTime && key == index) {
    //       // console.log(this.ticketFormMain.controls['ticketFormArray']);
    //       this.ticketFormMain.controls['ticketFormArray']['controls'][index]['controls']['ticketStartTime'].setValue(event);
    //       this.ticketFormMain.controls['ticketFormArray']['controls'][index]['controls']['ticketStartDate'].setValue(event);
    //       // this.ticketFormMain.controls['ticketFormArray']['controls'][index]['controls']['ticketEndTime'].setValue(event);
    //       // this.ticketFormMain.controls['ticketFormArray']['controls'][index]['controls']['ticketEndDate'].setValue(event);
    //     }
    //   });
    // }
    var currentTicketForm = (<FormGroup[]>(<FormArray>this.ticketFormMain.controls.ticketFormArray).controls)[index];
    var date = new Date();
    date.setHours(9, 0, 0, 0);
    currentTicketForm.get('ticketStartTime').patchValue(date);
  }

  onChangeDatePickerTicketEventEnddDate(event: Date, index) {
    // if (this.ticketFormMain && this.ticketFormMain.controls && this.ticketFormMain.controls.ticketFormArray && this.ticketFormMain.controls.ticketFormArray.value && Array.isArray(this.ticketFormMain.controls.ticketFormArray.value) && this.ticketFormMain.controls.ticketFormArray.value.length > 0) {
    //   this.ticketFormMain.controls.ticketFormArray.value.forEach((element, key) => {
    //     if (element && element.ticketStartTime && key == index) {
    //       this.ticketFormMain.controls['ticketFormArray']['controls'][index]['controls']['ticketEndTime'].setValue(event);
    //       this.ticketFormMain.controls['ticketFormArray']['controls'][index]['controls']['ticketEndDate'].setValue(event);
    //     }
    //   });
    // }
    var currentTicketForm = (<FormGroup[]>(<FormArray>this.ticketFormMain.controls.ticketFormArray).controls)[index];
    var date = new Date();
    date.setHours(17, 0, 0, 0);
    currentTicketForm.get('ticketEndTime').patchValue(date);

  }

  //show or hide ticketsetting for each ticket added
  toggleTicketSettings(i: number) {
    if (this.event_start_date && this.event_end_date) {
      this.ticketDisplay[i] = !this.ticketDisplay[i];
      this.ticketDisplay.forEach((element, key) => {
        if (element && i != key) {
          this.ticketDisplay[key] = false;
        }
      });
    } else {
      this.alertService.showNotification('Please set event timings before proceeding', 'error');
      this.timingRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
    }
  }

  closeAllTicketSettings() {
    this.ticketDisplay.forEach((element, key) => {
      if (element) {
        this.ticketDisplay[key] = false;
      }
    });
  }

  removeTicket(i: number) {
    var fa: FormArray = (<FormArray>this.ticketFormMain.get('ticketFormArray'));
    // if (fa.controls.length < 2) return;
    fa.removeAt(i);
    // this.ticketDisplay.splice(i);
  }

  //call to refresh the validity of ticketPrice field
  //used upon change in the ticketPrice field
  ticketPriceValidationRefresh(index) {
    (<FormArray>this.ticketFormMain.get('ticketFormArray')).at(index).get('ticketPrice').updateValueAndValidity();
    (<FormArray>this.ticketFormMain.get('ticketFormArray')).at(index).get('ticketServiceTax').updateValueAndValidity();
    (<FormArray>this.ticketFormMain.get('ticketFormArray')).at(index).get('ticketPrice').patchValue(0);
  }


  ticketServiceTaxValidator(dummy: any): ValidatorFn {

    return (control: AbstractControl): { [key: string]: any } | null => {
      const parentFormGroup: FormGroup = (<FormGroup>control.parent);
      if (parentFormGroup.get('ticketType').value == 'FREE') return null;
      else {
        if (control.value == 0) return { 'InvalidServiceTax': true };
        else return null;
      }
    };
  }

  ticketPriceValidator(dummy: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const parentFormGroup: FormGroup = (<FormGroup>control.parent);
      if (parentFormGroup.get('ticketType').value == 'FREE') {
        return null;
      }
      else {
        if (!control.value || control.value < 0) { return { 'InvalidPrice': true }; }
        else return null;
      }
    };
  }

  maxQtyValidator(dummy: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const parentFormGroup: FormGroup = (<FormGroup>control.parent);
      if (parentFormGroup.get('ticketQty').value < control.value) {
        return { 'largerThanQuantity': true };
      }
      else {
        if (control.value < 1) return { 'maxQtyInvalid': true };
        else return null;
      }
    };
  }


  // reorder(i: number){
  //   var formArrayRef: FormArray =  (<FormArray>this.ticketFormMain.get('ticketFormArray'))
  //   var currentForm: FormGroup = <FormGroup>formArrayRef.at(i);
  //   var targetIndex: number = currentForm.value.order - 1;
  //   if (formArrayRef.length === 1) return;
  //   if(targetIndex > formArrayRef.length-1) return;
  //   (<FormArray>this.ticketFormMain.get('ticketFormArray')).removeAt(i);
  //   formArrayRef.insert(targetIndex, currentForm); 
  // }

  markAllAsTouched() {

    if (!this.selectedCategory) {
      this.categoryRef.nativeElement.querySelector('#category').classList.add('ng-touched');
    }

    if (!this.selectedSubCategory) {
      this.categoryRef.nativeElement.querySelector('#subcategory').classList.add('ng-touched');
    }

    // mark all time inputs as touched
    var timeInputs = this.timingRef.nativeElement.querySelectorAll('input');
    timeInputs.forEach(element => {
      element.focus();
    })

    // mark all venue inputs as touched
    var venueInputs = this.venueRef.nativeElement.querySelectorAll('input');
    venueInputs.forEach(element => {
      element.focus();
      element.blur();
    });

    //mark all the tickets as touched
    (<FormArray>this.ticketFormMain.controls.ticketFormArray).controls.forEach((fg: FormGroup) => {
      Object.keys(fg.controls).forEach(fc => {
        const control = fg.get(fc);
        control.markAsTouched({ onlySelf: true });
      })
    })

    this.completeForm.nativeElement.focus();

  }

  //TODO not needed. 
  scrollToView(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
  }


  setPurchaseTiming(index, status) {
    var currentFG = (<FormGroup>(<FormArray>this.ticketFormMain.get('ticketFormArray')).at(index));
    if (status) {
      if(currentFG.get('ticketPurchaseStartDate').disabled){
        currentFG.get('ticketPurchaseStartDate').enable();
        currentFG.get('ticketPurchaseStartTime').enable();
        currentFG.get('ticketPurchaseEndDate').enable();
        currentFG.get('ticketPurchaseEndTime').enable();
      }
      currentFG.get('ticketPurchaseStartDate').patchValue(new Date());
      currentFG.get('ticketPurchaseStartTime').patchValue(new Date());
      currentFG.get('ticketPurchaseEndDate').patchValue(currentFG.get('ticketEndDate').value ? currentFG.get('ticketEndDate').value : this.event_end_date);
      currentFG.get('ticketPurchaseEndTime').patchValue(currentFG.get('ticketEndDate').value ? currentFG.get('ticketEndDate').value : this.event_end_date);
      currentFG.get('ticketPurchaseStartDate').setValidators(Validators.required);
      currentFG.get('ticketPurchaseStartTime').setValidators(Validators.required);
      currentFG.get('ticketPurchaseEndDate').setValidators(Validators.required);
      currentFG.get('ticketPurchaseEndTime').setValidators(Validators.required);
    } else {
      currentFG.get('ticketPurchaseStartDate').disable();
      currentFG.get('ticketPurchaseStartTime').disable();
      currentFG.get('ticketPurchaseEndDate').disable();
      currentFG.get('ticketPurchaseEndTime').disable();
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.allowNavigation) return true
    else return window.confirm('Changes will be lost. Do you want to proceed');
  }

  //possible values for param type - 'image' 'video' 'pdf'  
  exceedsFileTypeCount(fileType: string) {
    var type;
    switch (fileType) {
      case 'image':
        type = 'image_file';
        break;
      case 'video':
        type = 'video_file';
        break;
      case 'pdf':
        type = 'pdf_file';
        break;
      default:
        type = '';
        break;
    }
    var currCount = 0;
    var limits: any = { image_file: 10, video_file: 5, pdf_file: 5 };
    this.multiple_file_array.forEach((element) => {
      if (element.type == type) currCount += 1;
    });
    if (currCount >= limits[type]) return true;
    else return false;
  }

  
}
