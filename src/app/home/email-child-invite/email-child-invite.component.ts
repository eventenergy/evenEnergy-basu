import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RestAPIService, AlertService } from '../../_services/index';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-email-child-invite',
  templateUrl: './email-child-invite.component.html',
  styleUrls: ['./email-child-invite.component.css']
})
export class EmailChildInviteComponent implements OnInit {
  private unsubscribe$ = new Subject();
  email:string;
  
  constructor(
    private router: Router,
    private route:ActivatedRoute,
    private restApiService: RestAPIService,
    private alerService: AlertService,
  ) { 
    this.route.queryParams.takeUntil(this.unsubscribe$).subscribe(params => {
      if(params['user']){
        this.email = params['user'];
      }else{
        this.alerService.showNotification('Something went wrong','error');
        this.router.navigateByUrl('/login');
      }
    });
  }

  ngOnInit(){
    var obj = this;
    var email_pattern=new RegExp('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}');
    if(obj.email && obj.email.toString().trim() && email_pattern.test(obj.email)){
      obj.restApiService.postAPI('user/getByEmailId',{"email":obj.email.toString().trim()},(response)=>{
        if(response && response['id']){
          return this.router.navigate(['/login']);
        }else{
          return this.router.navigate(['/signup'], {queryParams:{'type':'user','email':this.email}})
        }
      });
    }else{
      this.alerService.showNotification('Something went wrong','error');
      this.router.navigateByUrl('/login');
    }
  }

}
