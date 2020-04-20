import { Injectable } from '@angular/core';

export interface ITicketOrder{
  success: boolean,
  amount: number,
  currency: string,
  receipt: string,
  paymentCapture: number,
  orderId: number,
  paymentOrder: string,
  eventBookingDetail: {
  capacityId: number,
    reqCapacity: number,
    currentCapacity: number
}[],
  message: string
}


export interface IPayForTicket {
  success:boolean,
  orderId: number,
  storyId: number,
  paymentOrder: string,
  paymentType: string,
  paymetSignature: string,
  paymentId: string,
  bookedByLoggedId:string
  tickets: ITicket[];
}

export interface ITicket {
  story: {
    id: number
  },
  user: {
    id: number
  },
  bookingOrder: {
    id: number
  },
  capacity: {
    id: number
  },
  attandeeName: string,
  email: string,
  mob: string,
  status: string
}

export interface ICapacity {
  "createdAt": number,
  "updatedAt": number,
  "id": number,
  "name": string,
  "capacityLimit": number,
  "capacityRemains": number,
  "minPurchase": number,
  "maxPurchase": number,
  "ticketPrice": string,
  "currency": string,
  "duration": any,
  "status": string,
  "story": null,
  "serviceCharge": any,
  "veneue": any
}

const GST: number = 0.18;

@Injectable({
  providedIn: 'root'
})
export class TicketGenerationService {
  currentBookOrder: ITicketOrder = null;

  selectedTickets: Array<any> = [];

  constructor() { }

  storeOrder(order: ITicketOrder){
    this.currentBookOrder = order;
  }

  getTicketOrder(): ITicketOrder{
    return this.currentBookOrder;
  }

  applyTaxesCharges(amount: number, serviceChargeObj: any){ 
    var gst = (serviceChargeObj.gstPercentage)/100;
    var amountWithGST = parseFloat((amount+(gst*amount)).toFixed(2));
    var serviceCharge = parseFloat((((serviceChargeObj.serviceChargePercentage)/100)*amountWithGST).toFixed(2));
    var paymentGateCharge = parseFloat((((serviceChargeObj.paymentGatewayPercentage)/100)*amountWithGST).toFixed(2));
    var gstForServiceCharges = parseFloat(((serviceCharge + paymentGateCharge)*gst).toFixed(2));
    return parseFloat((amountWithGST+serviceCharge+paymentGateCharge+gstForServiceCharges).toFixed(2));
  }

  saveTicketSelection(bookingObj){
    var index = this.selectedTickets.findIndex((item)=>{return item.capacityId==bookingObj.capacityId});
    if(index == -1) this.selectedTickets.push(bookingObj);
    else this.selectedTickets[index].selectedCount = bookingObj.selectedCount;
  }

  getTicketSelection(){return this.selectedTickets;}

  clearSavedSelection(){
    this.selectedTickets = [];
  }

}
