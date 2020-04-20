import { Component, OnInit } from '@angular/core';
import { RestAPIService, AlertService } from 'src/app/_services';

@Component({
  selector: 'app-super-admin-organization-approvals',
  templateUrl: './super-admin-organization-approvals.component.html',
  styleUrls: ['./super-admin-organization-approvals.component.scss']
})
export class SuperAdminOrganizationApprovalsComponent implements OnInit {
  unapprovedOrgs = [];
  currentPage: number = 0;
  isLoading: boolean = false;
  hasMoreStories: boolean = true;
  pageSize: number = 6;
  constructor(
    private restApiService: RestAPIService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.fetchSchools(); 
  }

  fetchSchools(){
    this.isLoading = true;
    this.restApiService.getData(`school/query?page=${this.currentPage}&size=${this.pageSize}&sort=id,desc`, (response)=>{
      console.log(response);
      if(response && Array.isArray(response.content)){
        response.content.forEach(org => {
          var currentOrg = {
            id: org.id,
            name: org.name,
            isApproved: false
          }
          this.unapprovedOrgs.push(currentOrg);
        });
      }
      this.currentPage++;
      this.isLoading = false;
    },
    ()=>{
      this.isLoading = false;
    })
  }

  markApprovedStats(org, isApproved){
    this.restApiService.postAPI(`school/authorize/${org.id}/${isApproved}`, {} ,(response)=>{
      org.isApproved = isApproved;
      this.alertService.showNotification(response.message, 'success');
    })
  }

}
