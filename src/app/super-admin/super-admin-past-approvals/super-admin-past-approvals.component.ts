import { Component, OnInit } from '@angular/core';
import { RestAPIService, AlertService } from 'src/app/_services';
import { HelperService } from 'src/app/_helpers';

interface IEventPriorityItem{
  id: number,
  name: string,
  organization: string,
  priorityStatus: EventPriority,
  publishedStatus: string,
}

enum EventPriority{
  VERY_LOW = 'VERY_LOW',
		LOW = 'LOW',
		MEDIUM = 'MEDIUM',
		HIGH = "HIGH",
		SUPER_HIGH = "SUPER_HIGH",
		PREMIUM = "PREMIUM",
}

@Component({
  selector: 'app-super-admin-past-approvals',
  templateUrl: './super-admin-past-approvals.component.html',
  styleUrls: ['./super-admin-past-approvals.component.scss']
})
export class SuperAdminPastApprovalsComponent implements OnInit {
  events: Array<IEventPriorityItem> = [];
  eventPriorities = [
    EventPriority.VERY_LOW, EventPriority.LOW,EventPriority.MEDIUM, EventPriority.HIGH, EventPriority.SUPER_HIGH
  ]
  currentPage: number = 0;
  isLoading: boolean = false;

  constructor(
    private restApiService: RestAPIService,
    private helperService: HelperService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.getEvents();
  }

  getEvents(){
    this.restApiService.getData(`story/query?status=PUBLISHED&sort=updatedAt,desc&page=${this.currentPage}&size=6`,
      (response)=>{
        if(response.content){
          this.currentPage++;
          response.content.forEach(event => {
            var eventEntry: IEventPriorityItem = {
              id: event.id,
              name: this.helperService.getEventTitle(event.caption),
              organization: "Unknown org",
              priorityStatus: event.priority? event.priority : EventPriority.MEDIUM,
              publishedStatus: event.status,
            }; 
            this.events.push(eventEntry);
          });
        }
      })
  }

/**
 * Perform a post api to update the priority of an event
 *
 * @param {IEventPriorityItem} event - event item whose priority need to be updated.
 * @param {EventPriority} priority - priority to update the event to.
 * @returns {undefined} - no return values. 
 */
  updatePriority(event: IEventPriorityItem, priority: EventPriority){
    this.restApiService.postAPI(`story/${event.id}/priority/${priority}`, {}, (response)=>{
      if(response.success){
        //to disable change button in the UI after update
        event.priorityStatus = priority;
        this.alertService.showNotification(response.message, 'success');
      }else{
        this.alertService.showNotification(response.message, 'error');
      }
    })
  }

}
