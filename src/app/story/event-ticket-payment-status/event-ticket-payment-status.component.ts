import { Component, OnInit, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { RestAPIService, AuthenticationService, AlertService } from 'src/app/_services';
import { HelperService } from 'src/app/_helpers';
import { DomSanitizer } from '@angular/platform-browser';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { LocalStorageService } from 'src/app/_services/local-storage.service';
import { TicketGenerationService } from 'src/app/_services/ticket-generation.service';
import { FormControl, Validators } from '@angular/forms';
declare let $: any;


@Component({
  selector: 'app-event-ticket-payment-status',
  templateUrl: './event-ticket-payment-status.component.html',
  styleUrls: ['./event-ticket-payment-status.component.scss']
})
export class EventTicketPaymentStatusComponent implements OnInit {
  private unsubscribe$ = new Subject();
  @ViewChild('story_content') story_content: ElementRef;
  @ViewChild('story_header_content') story_header_content: ElementRef;
  @ViewChild('printSection') printSection: ElementRef;
  @ViewChild('saveSection') saveSection: ElementRef;
  @ViewChild('ticketRef') ticketRef: ElementRef;

  nav_links = new Array<{ text: string, click: string, click_params: any }>();



  success: boolean = true;

  assetType = "";

  qrCode: string;
  user_id: number;
  user_email: string;
  user_mobile_number: number;
  order_id: number;
  total_amount: number = 0;
  ticket_details_array = new Array();
  story_id: number;
  story_background_color: string = "#ffffff";
  multiple_file_array = new Array();
  story_array = new Array();
  coverImageLink: any;
  story: any = {};
  bookedByLoggedId: string = "0";
  organizerOrganization: string = "";
  organizerEmail: string = "";
  organizerMobile: string = "";
  justPurchased: boolean = false;
  emailControl = new FormControl(null, { validators: [Validators.required, Validators.email] })
  phoneControl = new FormControl(null, { validators: [Validators.required] })
  constructor(
    private router: Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService: HelperService,
    private alertService: AlertService,
    public route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private storageService: LocalStorageService,
    private ticketGenerationService: TicketGenerationService,
  ) {
    this.nav_links.push({ text: 'Back', click: 'goBack', click_params: '' });
    if (this.storageService.getStoredData('justPurchased')) {
      this.justPurchased = true;
      this.storageService.deleteStoredData('justPurchased');
    }
    console.log('constructor of payment status page called');
  }

  ngOnInit() {

    this.qrCode = "0000000000";


    this.route.paramMap.takeUntil(this.unsubscribe$).subscribe(params => {
      this.assetType = this.route.snapshot.data.assetType;
      this.order_id = parseInt(params.get('id'));
      this.ticket_details_array = [];
      if (!isNaN(this.order_id)) {
        this.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((check_response) => {
          if (check_response) {
            if (check_response['user'] && check_response['user']['id']) {
              this.user_id = check_response['user']['id'];
              this.user_email = check_response['user']['email'];
              this.user_mobile_number = check_response['user']['mobile'];
            } else {
              this.bookedByLoggedId = localStorage.getItem("bookedByLoggedId");
              // isNaN("0");
              if (this.bookedByLoggedId && !isNaN(parseInt(this.bookedByLoggedId))) {
                this.user_id = parseInt(this.bookedByLoggedId);
              }
            }

            this.alertService.showLoader();

            this.success = true;
            if (this.assetType == 'order') this.loadOrderDetails();
            else this.loadTicketDetails();
          }

          // }else{
          //   if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
          //     obj.authenticateService.checkExpiryStatus();
          //   }
          //   return obj.router.navigate(['/login']);
          // }
        });
      } else {
        return this.helperService.goBack();
      }
    });
    setTimeout(() => {
      this.ticketRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 1000);

  }

  loadOrderDetails() {
    this.restApiService.getData('order/detailed/' + this.order_id, (response) => {
      if (response && response.orderId) {
        if (response.success) { this.success = true }
        else {
          this.success = false
          return;
        }
        this.total_amount = (response.amount / 100);
        this.story_id = response.story.id;
        this.qrCode = response.orderQRcode;

        //getting story details starts
        this.story.caption = this.helperService.getEventTitle(response.story.caption);
        this.getStoryDetail();
        //getting story details ends

        //getting capacity details
        if (response.eventBookingDetail && Array.isArray(response.eventBookingDetail) && response.eventBookingDetail.length > 0) {
          response.eventBookingDetail.forEach(element => {
            if (element.capacityId) {

              var ticket: any = {};
              ticket.name = element.capacity.name;
              ticket.reqCapacity = element.reqCapacity;
              ticket.amount = this.ticketGenerationService.applyTaxesCharges(parseInt(element.capacity.ticketPrice) * ticket.reqCapacity, element.capacity.serviceCharge);
              console.log('passed service charge');
              console.log(element.capacity.serviceCharge);
              ticket.line1 = element.capacity.veneue.name;
              ticket.line2 = element.capacity.veneue.address;
              ticket.line3 = element.capacity.veneue.addressSecondary;
              ticket.line4 = element.capacity.veneue.city + ' ' + element.capacity.veneue.pincode;
              ticket.startTime = new Date(element.capacity.duration.utcStart);
              ticket.endTime = new Date(element.capacity.duration.utcEnd);
              ticket.ticketDetails = element.ticketDetails;
              ticket.display = false;
              this.ticket_details_array.push(ticket);
            }


          });

          if (this.ticket_details_array.length > 1) {
            this.ticket_details_array.sort((a, b) => { return a.startTime.getTime() - b.startTime.getTime() })
          }
        }
      } else {
        // console.log('break point 1')
        // this.success = false;
        // this.total_amount = (response.amount / 100);
        // this.story_id = response.story.id;
        this.alertService.hideLoader();
        return false;
      }
    });
  }

  loadTicketDetails() {
    this.restApiService.getData('ticket/' + this.order_id, (response) => {
      this.story_id = response.story.id;
      this.qrCode = response.ticketQRCode;
      this.story.caption = this.helperService.getEventTitle(response.story.caption);
      this.getStoryDetail();

      var ticket: any = {};
      ticket.name = response.capacity.name;
      ticket.reqCapacity = 1;
      ticket.amount = this.ticketGenerationService.applyTaxesCharges(parseInt(response.capacity.ticketPrice) * 1, response.capacity.serviceCharge);
      ticket.line1 = response.capacity.veneue.name;
      ticket.line2 = response.capacity.veneue.address;
      ticket.line3 = response.capacity.veneue.addressSecondary;
      ticket.line4 = response.capacity.veneue.city + ' ' + response.capacity.veneue.pincode;
      ticket.startTime = new Date(response.capacity.duration.utcStart);
      ticket.endTime = new Date(response.capacity.duration.utcEnd);
      ticket.ticketDetails = [{attandeeName: response.attandeeName, email: response.email, mob: response.mob, status: response.status}];
      ticket.display = false;
      this.ticket_details_array.push(ticket);

    })
  }

  getStoryDetail() {
    this.restApiService.getData('story/detailed/' + this.story_id, (response) => {
      this.story_array.push(response);
      this.coverImageLink = this.helperService.getFirstStoryImage(response.text);
      this.organizerOrganization = response.createdUnderSchool.name;
      //get the organizer details from the user id from story/detailed
      this.restApiService.getData('user/' + response.userId, (userDataResponse) => {
        this.organizerEmail = userDataResponse.email;
        this.organizerMobile = userDataResponse.mobile;
      })
      this.alertService.hideLoader();
    })
  }

  goToActivityPage(story_id) {
    if (story_id) {
      return this.router.navigate(['/activity/preview/' + story_id]);
    }
  }

  /*
  * Default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    // localStorage.removeItem('payment_status_details');
  }
  goBack() {
    this.helperService.goBack();
  }

  saveTicketPdf() {
    this.restApiService.getData(`order/sendTicketToAttendee/order/${this.order_id}/ticket/0/type/GENERATEPDF`, (response) => {
      if (response && response.success) {
        this.helperService.saveBase64File('application/pdf', response.content, "Ticket-" + this.story.caption);
      } else {
        this.alertService.showNotification('PDF could not be downloaded, please try again later', 'error');
      }
    })
  }
  printTicket() {
    this.restApiService.getData(`order/sendTicketToAttendee/order/${this.order_id}/ticket/0/type/GENERATEPDF`, (response) => {
      if (response && response.success) {
        var url = "data:application/pdf;base64," + response.content;
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            var link = window.URL.createObjectURL(blob);
            var obj = document.createElement('object');
            obj.style.width = '100%';
            obj.style.height = '842pt';
            obj.type = 'application/pdf';
            obj.data = link;
            var myWindow = window.open('', '_blank');
            myWindow.document.body.appendChild(obj);
          });
      } else {
        this.alertService.showNotification('Could not process PDF, please try after some time', 'error');
      }
    })
  }

  sendToEmail(email: string) {
    this.restApiService.getData(`order/sendTicketToOther/order/${this.order_id}/ticket/0/type/SHARE_EMAIL/shareTo/${email}`, (response) => {
      if (response.success) this.alertService.showNotification('Ticket sent to ' + email, 'success');
      else this.alertService.showNotification('An error occurred when sending email, please try again later', 'error');
    }, (error) => { this.alertService.showNotification('An error occurred when sending email, please try again later', 'error'); })
  }

  smsToNumber(number) {
    console.log(number);
    this.restApiService.getData(`order/sendTicketToOther/order/${this.order_id}/ticket/0/type/SHARE_SMS/shareTo/${number}`, (response) => {
      if (response && response.success) this.alertService.showNotification('This ticket has been sent to +91' + number, 'success');
      else this.alertService.showNotification('Error occured while sending the SMS, please try again later', 'error');
    }, (error) => { this.alertService.showNotification('Error occured while sending SMS, please try again later', 'error'); })
  }

  sendConfirmationEmail(emailAddress: string = null) {
    this.restApiService.getData(`order/sendTicketToAttendee/order/${this.order_id}/ticket/0/type/EMAIL`, (response) => {
      if (response.success) {
        this.alertService.showNotification('Email has been sent to ' + this.user_email, 'success');
      }
      else throw new Error("Method not implemented");
    })
  }

  showModal(id: string){
    $('#'+id).modal('show');
  }

  closeModal(id: string){
    $('#'+id).modal('hide');
  }


}
