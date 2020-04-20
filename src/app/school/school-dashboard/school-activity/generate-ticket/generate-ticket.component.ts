import { Component, OnInit } from '@angular/core';
import {NgxPrintModule} from 'ngx-print';
import { AlertService } from 'src/app/_services';

@Component({
  selector: 'app-generate-ticket',
  templateUrl: './generate-ticket.component.html',
  styleUrls: ['./generate-ticket.component.scss']
})
export class GenerateTicketComponent implements OnInit {

  public qrCode: string;
  elementType = 'svg';
  value = 'someValue12340987';
  format = 'CODE128';
  lineColor = '#000000';
  width = 2;
  height = 100;
  displayValue = true;
  fontOptions = '';
  font = 'monospace';
  textAlign = 'center';
  textPosition = 'bottom';
  textMargin = 2;
  fontSize = 20;
  background = '#ffffff';
  margin = 10;
  // marginTop = 10;
  // marginBottom = 10;
  // marginLeft = 10;
  // marginRight = 10;
  constructor(
    private printModule:NgxPrintModule,
    private alertService: AlertService
    ) {
      this.qrCode="919944259269";
    }

  ngOnInit() {
    this.alertService.setTitle( 'Ticket' );//alert service for set title
  }
/*
  * Angular default life cycle method
  */
 ngAfterViewInit(): void {
  document.getElementById("printbtn").click();
}
 printDiv(divName) {
  var printContents = document.getElementById(divName).innerHTML;
  var popupWin = window.open('', '_blank', 'width=300,height=300');
  popupWin.document.open();
  popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="./generate-ticket.component.scss" /></head><body onload="window.print()">' + printContents + '</body></html>');
  popupWin.document.close();
}
}
