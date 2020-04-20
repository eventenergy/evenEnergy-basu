import { Component, OnInit, Input } from '@angular/core';
import { RestAPIService } from 'src/app/_services';

@Component({
  selector: 'app-event-ticket-cancellation',
  templateUrl: './event-ticket-cancellation.component.html',
  styleUrls: ['./event-ticket-cancellation.component.scss']
})
export class EventTicketCancellationComponent implements OnInit {
  constructor(private restApiService: RestAPIService) { }
  
  @Input() ticketDetails: Array<any>;
  displayConfirmation: boolean = false;
  selectedTickets: Array<any> = [];
  
  ngOnInit() {
    console.log("log from cancellation component");
    console.log(this.ticketDetails);
  }


  handleSubmit(formData: any){
    this.selectedTickets = [];
    Object.entries(formData).forEach(([key, value])=>{
      if(value){
        this.selectedTickets.push(value);
      }
      this.displayConfirmation = true;
    })
  }

  cancelTicket(ticketsArray: Array<any>){
    //convert ticket objects to array of ticket ids
    var ticketIdArr = ticketsArray.map((ticket)=>{return ticket.id.toString()});
    this.restApiService.postAPI('order/cancelTicket', ticketIdArr, (resp)=>{
      console.log(resp);
    });

  }

  addRemoveTicket(selection, ticket){
    if(selection) this.selectedTickets.push(ticket);
    else{
      //remove the ticket from selectedTickets
      var targetIndex = this.selectedTickets.findIndex((ticketFromArray)=>{return ticket.id == ticketFromArray.id});
      if(targetIndex > -1) this.selectedTickets.splice(targetIndex, 1);
      console.log(this.selectedTickets);
    }
  }

  // findTicket(ticketId: number){
  //   this.ticketDetails.forEach((capacity)=>{
  //     capacity.ticketDetails.foreach((ticket)=>{
  //       if(ticket.id == ticketId) return ticket;
  //     })
  //   })
  // }

}
