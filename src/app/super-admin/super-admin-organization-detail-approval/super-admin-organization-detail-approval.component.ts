import { Component, OnInit } from '@angular/core';
import { Router, Route, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { RestAPIService, AlertService } from 'src/app/_services';
import { AWS_DEFAULT_LINK } from '../../config';

@Component({
  selector: 'app-super-admin-organization-detail-approval',
  templateUrl: './super-admin-organization-detail-approval.component.html',
  styleUrls: ['./super-admin-organization-detail-approval.component.scss']
})
export class SuperAdminOrganizationDetailApprovalComponent implements OnInit {
  organizationId: number;
  organization: any;
  organizers: Array<any> = [];
  bankDetails: any;
  bankSnaps: Array<any> = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private restApiService: RestAPIService,
    private alertService: AlertService) { 
      this.organizationId = +this.route.snapshot.paramMap.get('orgId');
    }

  ngOnInit() {
      this.restApiService.getData('school/'+this.organizationId, (resp)=>{
        this.organization = resp
      })
      this.restApiService.getData('school/getOrganizers/'+this.organizationId, (resp)=>{
        if(resp && Array.isArray(resp)){
          var organizerUserId: number;
          organizerUserId = resp[0].user.id;
          resp.forEach((organizer)=>{
            var currOrganizer: any = {
              id: organizer.user.id,
              name: organizer.user.userProfile.firstName + " " + organizer.user.userProfile.lastName,
              email: organizer.user.email,
              mobile: organizer.user.mobile
            }
            this.organizers.push(currOrganizer);
          })
          if(organizerUserId){
            this.restApiService.getData('user/bankAccount/'+organizerUserId, (bankDetailsResp)=>{
              if(bankDetailsResp && Array.isArray(bankDetailsResp)) {
                bankDetailsResp[0].snaps.forEach(snap => {
                  snap.imgPath = AWS_DEFAULT_LINK + snap.imgPath;
                });
                this.bankDetails = bankDetailsResp[0];
              };
            })
          }
        }
      })
  }

  markApprovedStats(org, isApproved){
    this.restApiService.postAPI(`school/authorize/${org.id}/${isApproved}`, {} ,(response)=>{
      org.isApproved = isApproved;
      this.alertService.showNotification(response.message, 'success');
    })
  }

}
