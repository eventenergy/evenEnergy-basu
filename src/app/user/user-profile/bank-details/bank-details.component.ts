import { Component, OnInit } from '@angular/core';
import { RestAPIService, AuthenticationService, AlertService,DataService } from '../../../_services';
import { HelperService } from '../../../_helpers';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { UserBankAccount } from '../../user-profile-bank-account/userbankaccount';
import { AWS_DEFAULT_LINK }  from '../../../config';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit {
  private unsubscribe$ = new Subject();
  userBankAccountModel=new UserBankAccount();
  type:string='add';
  id:number=0;
  user_id:number;
  register_bank_details = new Array();
  uploadedSnaps = new Array<string>();
  constructor(
    private router:Router,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private helperService : HelperService,
    private dataService :DataService,
    private alertService: AlertService
  ) { 
    if(this.dataService.hasUserId()){
      this.user_id = this.dataService.hasUserId();
    }else{
      this.helperService.goBack();
    }
    
  }

  ngOnInit() {
    this.userBankAccountModel= new UserBankAccount();
    if(this.user_id){
      console.log(this.user_id);
      this.restApiService.getData('user/bankAccount/'+this.user_id,(bank_response)=>{
        console.log(bank_response);
        if (bank_response && Array.isArray(bank_response) && bank_response.length > 0) {
          if(Array.isArray(bank_response[0].snaps)){
            bank_response[0].snaps.forEach(snap => {
              snap.imgPath = AWS_DEFAULT_LINK + snap.imgPath;              
            });
          }
          this.register_bank_details = bank_response;
        } console.log('this is the final bank_response', bank_response);
      });
    }else {
      this.alertService.showNotification('Something went wrong', 'error');
    }
    
  }

  
}
