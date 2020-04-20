import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { RestAPIService, AuthenticationService, DataService } from 'src/app/_services';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from 'src/app/config';

@Component({
  selector: 'app-default-school-about',
  templateUrl: './default-school-about.component.html',
  styleUrls: ['./default-school-about.component.scss']
})
export class DefaultSchoolAboutComponent implements OnInit {

  private unsubscribe$ = new Subject();
  @Input() school_id;
  school_details;
  constructor(
    private restApiService: RestAPIService,
    private router:Router,
    private dataService: DataService,
    private authenticateService: AuthenticationService,
  ) { }

  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
            obj.showSchoolDetails();
        }else{
          return obj.router.navigate(['/login']);
        }
      }else{
        if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
          obj.authenticateService.checkExpiryStatus();
        }
        return obj.router.navigate(['/login']);
      }
    });
  }

  /* 
  * Get teacher based on classroom
  */
  showSchoolDetails(){
    if(this.school_id){
      this.dataService.getSchoolDetails().takeUntil(this.unsubscribe$).subscribe((saved_school_response)=>{
        if(saved_school_response){
          this.assignSchooolData(saved_school_response);
        }else{
          this.restApiService.getData('school/'+this.school_id,(school_details_response)=>{
            if(school_details_response && school_details_response.id && school_details_response){
              this.assignSchooolData(school_details_response);
            }
          });
        }
      });
    }
  }

  /* 
  * Function to assign data
  */
  assignSchooolData(school_details_response){
    if(school_details_response && school_details_response.id && school_details_response){
      this.school_details = [];
      this.school_details['id'] = school_details_response.id;
      this.school_details['name'] = school_details_response.name;
      if(school_details_response['defaultSnapId']){
        this.restApiService.getData('snap/'+school_details_response['defaultSnapId'],(snap_details_response)=>{
          if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
            this.school_details['staticDpImg']= AWS_DEFAULT_LINK+snap_details_response.imgPath;
          }
        });
      }else{
        this.school_details['staticDpImg']='';
      }
      this.school_details['imgName'] = (school_details_response.name ? school_details_response.name.slice(0,1) : '');
      this.school_details['email'] = school_details_response.emailAddress;
      this.school_details['mobile'] = school_details_response.mobNo;
      this.school_details['website'] = school_details_response.website;
      this.school_details['address'] = school_details_response.address;
      this.school_details['about'] = school_details_response.about;
    }
  }

  

  /*
  * default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
