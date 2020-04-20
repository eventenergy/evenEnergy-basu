import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RestAPIService, AuthenticationService, AlertService } from 'src/app/_services';
import { Subject } from 'rxjs';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { HelperService } from '../../../_helpers/index';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ConvertTextService } from 'src/app/_services/convert-text.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-current-tickets',
  templateUrl: './current-tickets.component.html',
  styleUrls: ['./current-tickets.component.scss'],
  providers: [DatePipe]
})
export class CurrentTicketsComponent implements OnInit {

  private unsubscribe$ = new Subject();

  order_id: number;
  user_id: number;
  user_email: string;
  user_mobile_number: number;
  bookedByLoggedId: string = "0";
  success: boolean;
  total_amount: number = 0;
  ticket_details_array = new Array();
  story_id: number;
  qrCode: string;
  tickets: Array<any> = [];
  itemsPerPage: number = 4;
  hasMoreTickets: boolean = true;
  pageSize: number = 4;
  loadingTickets: boolean = false;
  currentPage: number = 0;
  currQueryParam: string = null;
  searchCondition: string = null;
  queryParamStart: Date;
  queryParamEnd: Date;
  queryString: string;

  constructor(
    private router: Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService: HelperService,
    private alertService: AlertService,
    public route: ActivatedRoute,
    private convertTextService: ConvertTextService,
    private datePipe: DatePipe
  ) {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe(async (check_response) => {
      if (check_response) {
        if (check_response['user'] && check_response['user']['id']) {
          obj.user_id = check_response['user']['id'];
          obj.user_email = check_response['user']['email'];
          obj.user_mobile_number = check_response['user']['mobile'];
        } else {
          this.bookedByLoggedId = localStorage.getItem("bookedByLoggedId");
          // isNaN("0");
          if (this.bookedByLoggedId && !isNaN(parseInt(this.bookedByLoggedId))) {
            obj.user_id = parseInt(this.bookedByLoggedId);
          }
        }

        
      } else {
        //TODO handle this
      }
      // if(response){
      //   if(response['user'] && response['user']['id']){
      //   }else{
      //     return obj.router.navigate(['/login']);
      //   }
      // }else{
      //   if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
      //     obj.authenticateService.checkExpiryStatus();
      //   }
      //   return obj.router.navigate(['/login']);
      // }
    });
    this.currQueryParam = '';
    this.route.paramMap.takeUntil(this.unsubscribe$).subscribe((param: ParamMap)=>{
      this.currQueryParam = param.get('type');
      this.queryParamStart = new Date();
      this.queryParamEnd = new Date();
      if(this.currQueryParam == 'current'){
        this.queryParamEnd.setFullYear(this.queryParamEnd.getFullYear() + 2)
      }
      else if(this.currQueryParam == 'past'){
        this.queryParamStart.setFullYear(this.queryParamStart.getFullYear() - 2);
      }
      this.hasMoreTickets = true;
      this.currentPage = 0;
      this.tickets = [];
      this.loadTickets();
    });
  }



  /* 
  * Angular default lifecycle method
  */
  async ngOnInit() {    
    this.alertService.setTitle( 'Tickets' );//alert service for set title
  }

//add new tickets to the tickets array
async queryTickets() {
  this.alertService.showLoader();
  console.log(this.datePipe.transform(this.queryParamStart, "yyyy-MM-dd HH:mm:ss"))
  this.loadingTickets = true;
  return new Promise(resolve => {
    this.restApiService.getData(`order/query?userId=${this.user_id}&status=SUCCESS&story.durations.utcEnd=${this.datePipe.transform(this.queryParamStart, "yyyy-MM-dd HH:mm:ss")}&story.durations.utcEnd=${this.datePipe.transform(this.queryParamEnd, "yyyy-MM-dd HH:mm:ss")}&page=${this.currentPage}&size=${this.pageSize}&sort=updatedAt,desc`, //${this.currQueryParam=='current'? 'asc': 'desc'} 
    (response) => {
      if (response && response.content) {
        if(response.content.length < this.pageSize) {console.log('the content length is ' + response.content.length); this.hasMoreTickets = false;}
        response.content.forEach((capacityBooking) => {
          var curBooking :any = {}; 
          var totalTickets: number = 0;
          
          //find the earliest capacity 
          var earliestCapacityDate: Date = null;
          var earliestCapacityName: string = null;
          var earliestCapacityVenue: string = null;
          capacityBooking.eventBookingDetail.forEach(booking=>{
            totalTickets += booking.reqCapacity;
            if(!earliestCapacityDate){
              earliestCapacityDate = new Date(booking.capacity.duration.utcStart);
              earliestCapacityName = booking.capacity.name;
              earliestCapacityVenue = booking.capacity.veneue.city;
            }
            else{
              var currDate = new Date(booking.capacity.duration.utcStart);
              if(currDate.getTime()<earliestCapacityDate.getTime()){
                earliestCapacityDate = currDate;
                earliestCapacityName = booking.capacity.name;
                earliestCapacityVenue = booking.capacity.veneue.city;
              }
            }
          })
          curBooking.amount = (capacityBooking.amount)/100;
          curBooking.eventName = this.convertTextService.getEventTitle(capacityBooking.story.caption);
          curBooking.id = capacityBooking.orderId;
          curBooking.totalCapacities = capacityBooking.eventBookingDetail.length;
          curBooking.totalTickets = totalTickets;
          curBooking.venue = earliestCapacityVenue;
          curBooking.utcStart = earliestCapacityDate;
          curBooking.capName = earliestCapacityName;
          this.tickets.push(curBooking);
        });

        resolve(response.content.length);
        this.loadingTickets = false;
      } else { resolve(); }
    }, ()=>{
      this.loadingTickets = false;
      this.hasMoreTickets = true;
      this.alertService.showNotification('Error occored while loading tickets', 'error');
    })
    this.alertService.hideLoader();
  })
}
  //fetch event name from API and store in the tickets array in the object at the provided index;
  getEventDetails(storyId, i) {
    this.restApiService.getData('story/detailed/' + storyId, (response) => {
      if (response && response.caption) {
        console.log("this is the story id" + storyId);
        console.log('response for story/detailed with capacity id : '+ this.tickets[i].capacities[0]);
        this.tickets[i].storyName = response.caption;
        if (this.tickets[i].capactiyCount > 1) {
          this.tickets[i].eventStartTime = new Date(response.durations.utcStart);
        }
      }
      else {
        this.tickets[i].storyName = "Event name not available";
      }

      var capacities = response.capacities;
      if (Array.isArray(capacities)) {
        if (Array.isArray(capacities)) {
          var matchingCap = capacities.find((capacity) => {
            return capacity.id == this.tickets[i].capacities[0];
          })
        }
      }
    });
  }

  //add capacityDetails to the tickets array. Adds capacity name and StartTime
  getCapacityDetails(capacityId, i) {
    if (capacityId) {
      this.restApiService.getData('capacity/' + capacityId, (response) => {
        if (response && response.name) {
          this.tickets[i].capacityName = response.name;
          this.tickets[i].startTime = new Date(response.duration.utcStart);
        }
      })
    } else {
      this.tickets[i].capacityName = "Could not find Capacity Name";
    }

  }

  

  //populate order-details in "x" number of new tickets added to the tickets array
  async getTicketDetails(x) {
    var i = this.tickets.length - 1;
    for (; i >= this.tickets.length - x; i--) {
      //await for getOrderDetails because it adds capacityId to tickets array 
      //which is required by getCapacityDetails()
      await this.getOrderDetails(this.tickets[i].orderId, i);
      this.getCapacityDetails(this.tickets[i].capacityId, i);
      this.getEventDetails(this.tickets[i].storyId, i);
    }
  }

  //fills-in the order-details to the orderId provided to the corresponding 
  //item in the tickets array(identified using the index provided)
  getOrderDetails(orderId: number, i) {
    return new Promise((resolve) => {
      this.restApiService.getData('order/detailed/' + orderId, (response) => {
        if (response && response.success) {
          this.tickets[i].amount = response.amount;
          if (Array.isArray(response.eventBookingDetail)) {
            var ticketCount = 0;
            var capactiyCount = 0;
            var currentCapacityId = 0;
            var capactiies: Array<number> = [];
            response.eventBookingDetail.forEach((capacity) => {
              capactiyCount++;
              capactiies.push(capacity.capacityId);
              ticketCount = ticketCount + capacity.reqCapacity;
              if (!currentCapacityId) currentCapacityId = capacity.capacityId;
            })
            this.tickets[i].totalTickets = ticketCount;
            this.tickets[i].capacityCount = capactiyCount;
            this.tickets[i].capacityId = currentCapacityId;
            this.tickets[i].capacities = capactiies;
            resolve();
          }
        }
      })
    })
  }

  async loadTickets() {
    var count = await this.queryTickets();
    this.currentPage++;
  }

  // debug() {
  //   console.log(this.tickets);
  // }

}