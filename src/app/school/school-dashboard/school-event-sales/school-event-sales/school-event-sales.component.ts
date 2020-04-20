import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap } from '@angular/router';
import { map } from 'rxjs/operators';
import { RestAPIService } from 'src/app/_services';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-school-event-sales',
  templateUrl: './school-event-sales.component.html',
  styleUrls: ['./school-event-sales.component.scss']
})
export class SchoolEventSalesComponent implements OnInit {
  eventId: number;
  eventName: string;
  errorMessage: string;
  constructor(
    private route: ActivatedRoute,
    private apiService: RestAPIService,
    private helperService: HelperService
    ) { }

  ngOnInit() {
    this.eventId = parseInt(this.route.snapshot.paramMap.get('event-id'));

    if(this.eventId){
      this.apiService.getData('story/detailed/'+this.eventId, (response)=>{
        if(response && response.id){
          this.eventName = this.helperService.getEventTitle(response.caption);
        }else this.errorMessage = 'There was an error fetching data for this event';
      }, error => this.errorMessage = 'There was an error fetching data for this event')
    }
  }

  downlaodFile(){
    this.apiService.downloadAWSFile('story/invoiceReport/'+this.eventId, (response)=>{this.apiService.downLoadFile(response, "application/ms-excel")});
  }
}
