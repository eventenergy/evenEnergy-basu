import { Component, OnInit } from '@angular/core';
import { RestAPIService, AlertService, AuthenticationService } from 'src/app/_services';
import { HelperService } from 'src/app/_helpers';

@Component({
  selector: 'app-super-admin-event-approvals',
  templateUrl: './super-admin-event-approvals.component.html',
  styleUrls: ['./super-admin-event-approvals.component.scss']
})
export class SuperAdminEventApprovalsComponent implements OnInit {

  constructor(
    private restApiService: RestAPIService,
    private helperService: HelperService,
    private alertService: AlertService,
    private authenticationService: AuthenticationService
    ) { }
  stories: Array<any> = new Array();
  currentPage: number = 0;
  isLoading: boolean = false;
  hasMoreStories: boolean = true;
  pageSize: number = 6;

  ngOnInit() {
    this.fetchEvents();
  }

  fetchEvents(){
    this.isLoading = true;
    this.restApiService.getData(`story/query?status=SUBMITTED&size=6&sort=updatedAt,desc&page=${this.currentPage}&size=${this.pageSize}`, (response)=>{
      console.log(response);
      if(response && Array.isArray(response.content)){
        if(response.content.length < this.pageSize) this.hasMoreStories = false;
        response.content.forEach((story)=>{
          var item : any = {};
          item.id = story.id;
          item.eventName = this.helperService.getEventTitle(story.caption);
          item.image = this.helperService.getFirstStoryImage(story.text);
          item.approved = false;
          this.stories.push(item);
        })
      }
      this.currentPage++;
      this.isLoading = false;
    },
    ()=>{
      this.isLoading = false;
    })
  }

  updateEvent(state, index){
    var story = this.stories[index];
    this.restApiService.postAPI(`story/${story.id}/state/publish`, {}, (response) => {
      if (response) {
        if (response.success) {
          story.approved = true;
          this.alertService.showAlertBottomNotification('Event published');
        } else {
          if (response['message']) {
            this.alertService.showNotification(response['message'], 'error');
          }
        }
      } else {
        this.alertService.showNotification('something went wrong', 'error');
      }
    });
  }

  debug(){
    console.log(this.authenticationService.isSuperAdmin());
  }
}
