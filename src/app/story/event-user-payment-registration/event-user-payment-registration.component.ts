import { Component, OnInit, ElementRef, ViewChild, Renderer2, AfterViewInit, NgZone, HostListener } from '@angular/core';
import { TicketGenerationService, IPayForTicket, ITicket, ICapacity } from 'src/app/_services/ticket-generation.service';
import { FormArray, FormControl, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms'
import { RestAPIService, AlertService, AuthenticationService } from 'src/app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable, of, AsyncSubject } from 'rxjs';
import { HelperService } from 'src/app/_helpers';
import { DomSanitizer } from '@angular/platform-browser';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import * as IntlTelInput from 'intl-tel-input';
import { Location } from '@angular/common';
import { take, switchMap, first } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { HttpClient } from '@angular/common/http';
import { LazyLoadingService } from 'src/app/_services/lazy-loading.service';
import { filter } from 'rxjs/operators';

declare var razorPayJS: any;
// const razorPayUrl = "https://checkout.razorpay.com/v1/checkout.js";
@Component({
  selector: 'app-event-user-payment-registration',
  templateUrl: './event-user-payment-registration.component.html',
  styleUrls: ['./event-user-payment-registration.component.scss']
})
export class EventUserPaymentRegistrationComponent implements OnInit {
  mobileNos: Array<string> = [];



  private unsubscribe$ = new Subject();
  user_id: number;
  user_email: string;
  user_mobile: number;
  user_name: string;
  //holds all the attendee form information
  registrationFormArray: FormArray = new FormArray([]); razorPayIns: any;
  selectedCapacities: IPayForTicket;
  ticketToBeReleased: boolean;
  ticketRelease$: Subject<boolean> = new AsyncSubject<boolean>();

  //numbering of forms (attendee 1[ticket-name], attendee 2[ticket-name]...)
  formNumberingArray: Array<number> = [];

  //used to implement show hide for individual forms
  formDisplayArray: Array<boolean> = [];

  //for email validation
  emailRegex: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  //this array has intl-tel-input plugin object that enables international phone
  //input and validation
  regMobileInputObjsArray: Array<IntlTelInput.Plugin> = [];

  ticketBookingRequest: IPayForTicket;
  tickets: ITicket[] = [];
  capacities: ICapacity[];
  showTaxBreakup: boolean = false;

  //Timer for order exipiration
  timeLeftMin: number = 14;
  timeLeftSec: number = 60;
  interval;
  tokenRefreshed: boolean = false;

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.editOrderDetails(this.story_id);
  }
  //reference to the form html element
  @ViewChild("registrationForm") form: ElementRef;
  @ViewChild("initScrollDest") initScrollDest: ElementRef;
  @ViewChild("regForm") regForm: ElementRef;
  test: ElementRef;
  currentOrderDetails = new Array();

  total_ticket_count: number = 0;
  story_array = new Array();

  story_id: number;
  order_id: number;
  ticket_information_details = new Array();
  @ViewChild('story_content') story_content: ElementRef;
  @ViewChild('story_header_content') story_header_content: ElementRef;

  registration_form_details = new Array();
  multiple_file_array = new Array();
  nav_links = new Array<{ text: string, click: string, click_params: any }>();
  marker = new Array();

  // google maps zoom level
  zoom: number = 12;
  story_background_color: string = "#ffffff";

  // initial center position for the map
  lat: number = 12.9542944;
  lng: number = 77.4905086;
  markers: marker[];

  event_user_email: string;
  event_user_mobile: number;
  event_user_name: string;

  bookedByLoggedId: string = "0";
  paymentActivated: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private ticketGenerationService: TicketGenerationService,
    private restApiService: RestAPIService,
    private router: Router,
    private alertService: AlertService,
    private authenticateService: AuthenticationService,
    private helperService: HelperService,
    public route: ActivatedRoute,
    private renderer: Renderer2,
    private storageService: LocalStorageService,
    private ngZone: NgZone,
    private http: HttpClient,
    private lazyLoadingService: LazyLoadingService,
    private location: Location,
  ) {

    this.http.get('./assets/js/RP.json').subscribe((json: any)=>{
      this.orderOptions.key = json.key;
    })

    this.lazyLoadingService.loadScript('https://checkout.razorpay.com/v1/checkout.js');
    this.lazyLoadingService.loadScript('./assets/js/custom.js');
    this.nav_links.push({ text: 'Back', click: 'goBack', click_params: this });
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
  }

  orderOptions: any = {
    "scope": this,
    "key": "cnpwX2xpdmVfUUtaUGVNeDBXYUEyWDY=",//live mode key
    // "key": "cnpwX3Rlc3RfeEJQbU1rM2o0WXFSczE=",//test mode key // Enter the Key ID generated from the Dashboard //rzp_test_xBPmMk3j4YqRs1 //rzp_live_QKZPeMx0WaA2X6
    "amount": "0", // Amount is in currency subunits. Default currency is INR. Hence, 29935 refers to 29935 paise or INR 299.35.
    "currency": "INR",
    "name": "Pay to Eventenergies",
    "description": "",
    "image": "/assets/images/events/llogo.png",
    "order_id": "order_9A33XWu170gUtm",//Order ID is generated as Orders API has been implemented. Refer the Checkout form table given below
    "handler": function (response) {
      alert(response.razorpay_payment_id);
      // console.log(response);
      // this.prodOneOrder="";

    },
    "modal": {
      "ondismiss": () => {
        this.paymentActivated = false;
      }
    },
    // callback_url: 'http://localhost:4200',
    // redirect: true,
    "prefill": {
      "name": "",
      "email": ""
    },
    "notes": {
      "address": "note value"
    },
    "theme": {
      "color": "#337ab7"
    }
  };

  ngOnInit() {
    // this.timeLeftMin = 0;
    // this.timeLeftSec = 30;
    var obj = this;
    this.route.paramMap.takeUntil(this.unsubscribe$).subscribe(params => {
      this.order_id = parseInt(params.get('id'));
      if (!isNaN(this.order_id)) {
        obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((check_response) => {
          console.log("User Auth: ", check_response);
          if (check_response) {
            if (check_response['user'] && check_response['user']['id']) {
              obj.user_id = check_response['user']['id'];
              obj.user_email = check_response['user']['email'];
              obj.user_mobile = check_response['user']['mobile'];
              obj.event_user_name = check_response['user']['userProfile']['firstName'] + ' ' + check_response['user']['userProfile']['lastName'];
            } else {
              this.bookedByLoggedId = localStorage.getItem("bookedByLoggedId");
              // isNaN("0");
              if (this.bookedByLoggedId && !isNaN(parseInt(this.bookedByLoggedId))) {
                obj.user_id = parseInt(this.bookedByLoggedId);
              }
              console.log("obj.user_id:", obj.user_id);
            }
            this.restApiService.getData('order/detailed/' + obj.order_id, (order_details_response) => {
              console.log(order_details_response);
              if (order_details_response && order_details_response.success) {
                if (order_details_response) {
                  this.currentOrderDetails = order_details_response;
                }
                console.log("this.currentOrderDetails-im res", this.currentOrderDetails);
                if (localStorage.getItem('event_total_amount_details')) {
                  console.log('local storage returning error');
                  obj.ticket_information_details = JSON.parse(localStorage.getItem('event_total_amount_details'));
                } else {
                  this.alertService.showNotification('Something went wrong, please try again', 'error');
                  console.log("Go to login page");
                  return obj.router.navigate(['/login']);
                }

                if (this.currentOrderDetails
                  && this.currentOrderDetails['success']
                  && this.currentOrderDetails['orderId']
                  && this.currentOrderDetails['eventBookingDetail']
                  && Array.isArray(this.currentOrderDetails['eventBookingDetail'])
                  && this.currentOrderDetails['eventBookingDetail'].length > 0) {

                  this.currentOrderDetails['eventBookingDetail'].forEach((capacity) => {
                    if (capacity && capacity.capacityId) {
                      this.restApiService.getData('capacity/' + capacity.capacityId, (capacity_details_response) => {
                        if (capacity_details_response && capacity_details_response.id) {
                          var currentCapNumber = parseInt(capacity.reqCapacity);
                          this.total_ticket_count += capacity.reqCapacity;
                          for (var i = 0; i < currentCapNumber; i++) {
                            console.log("i=" + i);
                            if (i == 0) {
                              this.registrationFormArray.push(this.createAtendeeFormWithEmail(capacity_details_response.name, this.user_email, capacity_details_response.id));
                            } else {
                              this.registrationFormArray.push(this.createAtendeeForm(capacity_details_response.name, capacity_details_response.id));
                            }

                            this.formNumberingArray.push(i + 1);
                            this.formDisplayArray.push(true);
                          }
                        } else {
                          this.alertService.showNotification('Something went wrong');
                          return false;
                        }
                      });
                    }
                  });
                }

                if (order_details_response.storyId) {
                  obj.story_id = order_details_response.storyId;
                  obj.showPreviewDetails();

                } else {
                  this.alertService.showNotification('Something went wrong, please try again', 'error');
                  console.log("Go to login page");
                  return obj.router.navigate(['/login']);
                }
              } else if (order_details_response && !order_details_response.success) {
                this.alertService.showNotification('Something went wrong', 'error');
                return location.href = '/activity/preview/' + order_details_response.storyId;
              } else {
                this.alertService.showNotification('Something went wrong', 'error');
                return false;
              }
              console.log("this.currentOrderDetails", this.currentOrderDetails);
              // Timer Creation
              this.timeLeftMin = 14;
              this.timeLeftSec = 60;
              if (this.total_ticket_count > 10) {
                this.timeLeftMin = 29;
              }
              var orderCreatedAt = this.currentOrderDetails["orderCreatedAt"];
              var currTime = new Date().getTime();
              console.log(new Date());
              var diff = Math.floor((currTime - orderCreatedAt) / 1000); // To Sec
              if ((diff / 60) > 0) {
                this.timeLeftMin = this.timeLeftMin - Math.floor((diff / 60));
              }
              this.timeLeftSec = this.timeLeftSec - (diff % 60);
              console.log(orderCreatedAt, currTime, diff, this.timeLeftMin, this.timeLeftSec);
              this.interval = setInterval(() => {
                if (this.timeLeftSec > 0) {
                  this.timeLeftSec--;
                } else {
                  this.timeLeftMin--;
                  this.timeLeftSec = 60;
                }
                if (this.timeLeftMin < 0) {
                  // console.log('this.timeLeftMin ' + this.timeLeftMin);
                  // $('.mchild').modal('hide');
                  // $('#modal-close').click();
                  clearInterval(this.interval);
                  console.log("timeout was runnning");
                  this.alertService.showNotification('Order is Expired. Please try again', 'error');
                  // return this.router.navigate(['/activity/preview/' + this.story_id]);
                  return location.href = '/activity/preview/' + this.story_id;
                }
              }, 1000);
            });
            console.log('this.currentOrderDetails-if', this.currentOrderDetails);
            // } 
            // else {
            //   this.alertService.showNotification('Something went wrong, please try again', 'error');
            //   console.log("Go to login page");
            //   return obj.router.navigate(['/login']);
            // }
          } else {
            if (localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')) {
              obj.authenticateService.checkExpiryStatus();
            }
            console.log("Go to login page");
            return obj.router.navigate(['/login']);
          }
        });
      } else {
        return obj.helperService.goBack();
      }
    });
    this.storageService.storeData('justPurchased', false);

  }
  /*
    * Function to show preview details
    */
  showPreviewDetails() {
    this.alertService.showLoader();
    if (this.story_id) {
      this.restApiService.getData('story/detailed/' + this.story_id, (response) => {
        if (response && response.id) {
          let story = response;
          if (story.caption != '' && story.caption) {
            this.story_header_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.caption);
            var container = this.story_header_content.nativeElement.querySelectorAll('p');
            var container_main_array = Array.prototype.slice.call(container);
            container_main_array.forEach(main_element => {
              if (main_element.textContent) {
                story['caption_plain'] = main_element.textContent;
                this.orderOptions.description = 'Event: ' + main_element.textContent;
              }
            });
            story.caption = this.sanitizer.bypassSecurityTrustHtml(story.caption);
          }
          this.orderOptions.key = atob(this.orderOptions.key);
          // this.restApiService.getData('user/' + story.userId, (user_response) => {
          //   if (user_response && user_response.id && user_response.userProfile) {
          //     try {
          //       if (user_response.email) {
          //         this.event_user_email = user_response.email;
          //       }
          //       if (user_response.mobile) {
          //         this.event_user_mobile = user_response.mobile;
          //       }
          //       if (user_response.userProfile['firstName'] && user_response.userProfile['lastName']) {
          //         this.event_user_name = user_response.userProfile['firstName'] + user_response.userProfile['lastName'];
          //       }
          //       if (this.orderOptions && this.orderOptions.prefill) {
          //         this.orderOptions.key = atob(this.orderOptions.key);
          //         this.orderOptions.prefill.name = this.event_user_name;
          //         this.orderOptions.prefill.email = '';
          //       }
          //       if (user_response.userProfile['defaultSnapId']) {
          //         this.restApiService.getData('snap/' + user_response.userProfile['defaultSnapId'], (snap_details_response) => {
          //           if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
          //             story['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
          //           }
          //         });
          //       } else {
          //         story['staticDpImg'] = false;
          //       }
          //       story['createrFirstName'] = user_response.userProfile.firstName;
          //       story['createrLastName'] = user_response.userProfile.lastName;
          //     } catch (e) { }
          //   }
          // });

          if (response.veneus && Array.isArray(response.veneus) && response.veneus.length > 0) {
            response.veneus.forEach((address_element, key) => {
              if (address_element && key == 0) {
                this.lat = address_element.lat;
                this.lng = address_element.lng;
                this.markers = [{
                  lat: this.lat,
                  lng: this.lng,
                  label: 'A',
                  draggable: true
                }];
              }
            });
          }

          this.story_content.nativeElement.innerHTML = this.sanitizer.bypassSecurityTrustHtml(story.text);
          var container = this.story_content.nativeElement.querySelectorAll('div');
          var container_main_array = Array.prototype.slice.call(container);
          let image_count = 1;
          container_main_array.forEach(main_element => {
            if (main_element && main_element.style && main_element.style.backgroundColor) {
              this.story_background_color = main_element.style.backgroundColor;
            }
            var container_child_array = Array.prototype.slice.call(main_element.children);
            container_child_array.every(child_element => {
              if (child_element.tagName == "P") {
                this.multiple_file_array.push({ type: 'text_file', text_data: this.sanitizer.bypassSecurityTrustHtml(main_element.innerHTML), text_content: main_element.innerHTML });
              } else if (child_element.tagName == "IMG") {
                if (child_element.dataset.src) {
                  this.multiple_file_array.push({ type: 'image_file', image_src: AWS_DEFAULT_LINK + child_element.dataset.src, image_number: image_count });
                  image_count++;
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
              this.alertService.hideLoader();
            });
          });
          this.story_array.push(story);
        } else {
          this.alertService.showNotification('Something went wrong', 'error');
          this.helperService.goBack();
        }
        setTimeout(() => {
          this.initScrollDest.nativeElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }, 1000);
      });
    }
    else {
      this.alertService.showNotification('Something went wrong', 'error');
      this.helperService.goBack();
    }
  }

  createAtendeeFormWithEmail(capacityName: string, email: string, capacityId1: Number): FormGroup {
    console.log(email);
    this.mobileNos.push("");
    return new FormGroup({
      capacityName: new FormControl(capacityName),
      capacityId: new FormControl(capacityId1),

      fullName: new FormControl('', {
        validators: Validators.required,
        updateOn: 'blur'
      }),
      email: new FormControl(email, {
        validators: [Validators.required, Validators.email],
        updateOn: 'blur'
      }),
      mobile: new FormControl('', {
        validators: Validators.required,
        updateOn: 'blur'
      }),
      // city: new FormControl(),
      // cmpName: new FormControl(),
      // designation: new FormControl()
    }, { updateOn: 'blur' })
  }

  createAtendeeForm(capacityName: string, capacityId1: Number): FormGroup {
    console.log("createAtendeeFormWithEmail", capacityId1);
    this.mobileNos.push("");
    return new FormGroup({
      capacityName: new FormControl(capacityName),
      capacityId: new FormControl(capacityId1),
      fullName: new FormControl('', {
        validators: Validators.required,
        updateOn: 'blur'
      }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        updateOn: 'blur'
      }),
      mobile: new FormControl('', {
        validators: Validators.required,
        updateOn: 'blur'
      }),
      // city: new FormControl(),
      // cmpName: new FormControl(),
      // designation: new FormControl()
    }, { updateOn: 'blur' })
  }


  payFailure: any;

  async submitForm() {

    //refresh the accesstoken before proceeding(for the first time)
    if (!this.tokenRefreshed) {
      this.tokenRefreshed = true;
      var refreshObs = this.authenticateService.getRefreshInProgerss().pipe(filter(val => { return val == false }), first());
      this.authenticateService.refreshToken();
      await refreshObs.toPromise();
    }

    var formCount = this.registrationFormArray.length;
    this.tickets = [];
    if (this.registrationFormArray.valid) {
      this.registrationFormArray.controls.forEach((form: FormGroup, x) => {
        var ticket: ITicket = {
          story: { id: this.story_id },//this.selectedCapacities.storyId,
          user: { id: this.user_id },
          bookingOrder: { id: this.currentOrderDetails['orderId'] },
          capacity: { id: form.get('capacityId').value },
          attandeeName: form.value.fullName,
          email: form.value.email,
          mob: this.mobileNos[x],
          status: "UNPURCHASED",
        };
        this.tickets.push(ticket);
      });



      var scope = this;
      scope.ticketBookingRequest = {
        "success": true,
        "orderId": this.currentOrderDetails['orderId'],
        "storyId": this.story_id,//this.selectedCapacities.storyId,
        "paymentOrder": "",//this.selectedCapacities.paymentOrder,
        "paymentType": "RazorPay",//this.selectedCapacities.paymetType,
        "paymetSignature": "",//this.selectedCapacities.paymetSignature,
        "paymentId": "",//this.selectedCapacities.paymetId,
        "tickets": this.tickets,
        "bookedByLoggedId": this.bookedByLoggedId
      }

      // check to prevent calling payForTicket multiple times 
      if (this.paymentActivated) return;
      this.paymentActivated = true;
      this.restApiService.postAPI('order/payForTicket', scope.ticketBookingRequest, (response) => {
        scope.orderOptions.handler = function (resp) {
          console.log("razorpay Res: ", resp);
          if (resp) {
            if (resp.razorpay_payment_id) {
              response.paymentId = resp.razorpay_payment_id;
              if (resp.razorpay_order_id) {
                response.paymentOrder = resp.razorpay_order_id;
                if (resp.razorpay_signature) {
                  response.paymetSignature = resp.razorpay_signature;
                }
              }
            }
          }

          scope.alertService.showLoader();
          // scope.paymentActivated = false;
          // return;
          scope.restApiService.postAPI('order/updatePayment', response, (res: any) => {
            localStorage.removeItem('event_total_amount_details');
            localStorage.removeItem('payment_status_details');
            if (res.success == true) {
              console.log("MNB");
              localStorage.setItem('payment_status_details', 'success');
            } else {
              localStorage.setItem('payment_status_details', 'fail');
            }
            scope.storageService.storeData('justPurchased', true);
            //return location.href = 'event/order/' + scope.order_id + '/payment/status';
            scope.ticketGenerationService.clearSavedSelection();
            scope.ngZone.run(() => {
              scope.router.navigate(['event/order/' + scope.order_id + '/payment/status']);
            })
          });
        };
        // scope.orderOptions.modal.ondismiss = function () {
        //   console.log('Payment dismiss');
        //   // faild payment response
        //   if (scope.payFailure) {
        //     scope.payFailure = undefined;
        //     response.paymentStatus = "FAILED";
        //     scope.restApiService.postAPI('order/updatePayment', response, (res:any) => {
        //       console.log(res)
        //       localStorage.removeItem('event_total_amount_details');
        //       localStorage.removeItem('payment_status_details');
        //       localStorage.setItem('payment_status_details', 'failed');
        //       return location.href = 'event/order/' + scope.order_id + '/payment/status';
        //     });
        //   }
        //   scope.router.navigate(['/']);
        //   // end
        // };
        if (response.success) {
          console.log(response);
          scope.orderOptions.prefill = {
            email: this.user_email,
            contact: this.user_mobile,
            name: this.user_name
          };
          scope.orderOptions.amount = (scope.currentOrderDetails['amount']) + "";
          scope.orderOptions.currency = scope.currentOrderDetails['currency'];
          scope.orderOptions.order_id = response.paymetGatewayOrder;//scope.currentOrderDetails['paymentOrder'];
          console.log("scope.orderOptions", scope.orderOptions);
          this.razorPayIns = null;
          this.razorPayIns = razorPayJS.func1(scope.orderOptions);
          this.razorPayIns.on('payment.error', function (resp) {
            // console.log(resp);
            // // console.log(scope.prodOneOrder);
            scope.payFailure = resp;
          }); // will pass error object to error handler
          this.razorPayIns.on('ondismiss', function () {
            console.log('razor pay closed');
          }); // will pass error object to error handler
          this.razorPayIns.open();
        } else {
          this.paymentActivated = false;
          this.alertService.showNotification('An error occoured while processing your payment, please try again', 'error')
        }
      });
      return;
    }

    for (let index = 0; index < formCount; index++) {
      const fg = (<FormGroup>this.registrationFormArray.at(index));
      if (fg.invalid) this.formDisplayArray[index] = true;

      //for each FormGroup, get its controls
      Object.keys(fg.controls).forEach(fc => {

        //for each control, trigger display of form validation errors(if any) by marking as touched
        const control = fg.get(fc);
        control.markAsTouched({ onlySelf: true });
      });
    };

    //find first input that is not valid and set it to focus.
    var form = this.renderer.selectRootElement(this.form.nativeElement, true);
    var invalids = Array.from(form.getElementsByClassName('ng-invalid'));
    var firstInvalidInput: any = invalids.filter((item: any) => { return item.tagName == 'INPUT' })[0];

    //if any of the field is invalid
    if (firstInvalidInput) {
      firstInvalidInput.focus();
      firstInvalidInput.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }


  }

  /*
   * Re directing to get Direction page
   */
  routeToGoogleMaps() {
    if (this.lat && this.lng) {
      window.open('https://www.google.com/maps/dir/?api=1&destination=' + this.lat + ',' + this.lng, "_blank");
    }
  }

  editOrderDetails(story_id) {
    this.alertService.showLoader();
    this.ticketToBeReleased = true;
    var failedPayment = {
      message: null,
      orderId: this.order_id,
      success: false,
      paymentId: "",
      paymentOrder: "",
      paymentStatus: "FAILED",
      paymentGatewayOrder: "",
      paymentGatewayType: null,
      paymentSignature: ""
    }
    this.router.navigate(['/activity/preview/' + story_id]);
    this.restApiService.postAPI('order/updatePayment', failedPayment,
      (res: any) => { this.ticketRelease$.next(true); this.ticketRelease$.complete(); },
      (error) => { this.ticketRelease$.next(true); this.ticketRelease$.complete(); });
    if (story_id) {
      // console.log(this.registrationFormArray.value);
      // var registration_form_details = {};

      // localStorage.setItem('registration_form_details',JSON.stringify(this.registrationFormArray.value));   
    }
  }

  /*
    * Default Angular Destroy Method
    */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  //function registers each mobile number input to individual 
  //instances of IntlTelInput in the regMobileInputObjsArray
  CreateIntlTelObj(element: ElementRef) {
    this.regMobileInputObjsArray.push(IntlTelInput(element.nativeElement))
  }

  registerMobileValidation(index: number) {
    this.registrationFormArray.controls[index].get('mobile').setValidators([
      this.mobileValidator(this.regMobileInputObjsArray[index])
    ])
    this.registrationFormArray.controls[index].get('mobile').updateValueAndValidity();
  }

  mobileValidator(intlTelInput: IntlTelInput.Plugin): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];
      if (intlTelInput.isValidNumber()) return null;
      const errorCode = intlTelInput.getValidationError();
      return { "Invalid Number": errorMap[errorCode] };
    }
  }


  /*
  * Function to go Back
  */
  goBack(scope) {
    console.log("goBack", scope, this);
    // console.log("goBack",this.ticketBookingRequest);
    // console.log("ticketBookin:",scope.ticketBookingRequest);
    // scope.ticketBookingRequest['success'] = false;
    var ticketBookingRequest = {
      "success": false,
      "orderId": scope.currentOrderDetails['orderId'],
      "storyId": scope.story_id,//this.selectedCapacities.storyId,
      "paymentOrder": "",//this.selectedCapacities.paymentOrder,
      "paymentType": "",//this.selectedCapacities.paymetType,
      "paymetSignature": "",//this.selectedCapacities.paymetSignature,
      "paymentId": "",//this.selectedCapacities.paymetId,
      "tickets": scope.tickets,
      "bookedByLoggedId": scope.bookedByLoggedId
    }
    console.log("ticketBookin:", ticketBookingRequest);

    scope.restApiService.postAPI('order/updatePayment', ticketBookingRequest, (res: any) => {
      // localStorage.removeItem('event_total_amount_details');
      // localStorage.removeItem('payment_status_details');
      localStorage.removeItem('payment_status_details');
      //return location.href = 'event/order/' + scope.order_id + '/payment/status';
      // scope.helperService.goBack();
      // return scope.router.navigate(['event/order/' + scope.order_id + '/payment/status']);
      return location.href = '/activity/preview/' + scope.story_id;
    });

  }

  canDeactivate(): Observable<boolean> | boolean {
    console.log("routing");
    clearInterval(this.interval);
    // if (this.registrationFormArray.pristine) return true;
    if (this.ticketToBeReleased) return this.ticketRelease$.asObservable();
    else return true;
  }

}



interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}

