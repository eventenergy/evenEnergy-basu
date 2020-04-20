import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AWS_DEFAULT_LINK } from '../../../config';
import { HelperService } from '../../../_helpers';
import { AuthenticationService, RestAPIService, DataService, AlertService } from '../../../_services';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-school-class',
  templateUrl: './school-class.component.html',
  styleUrls: ['./school-class.component.scss']
})
export class SchoolClassComponent implements OnInit {
  private unsubscribe$ = new Subject();
  class_list_array=new Array();
  school_id:number;

  constructor(
    private router:Router,
    private helperService: HelperService,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private alertService: AlertService,
  ){}
  
  /* 
  *  Angular default life cycle method 
  */
  ngOnInit() {
    this.alertService.setTitle( 'Organization Class' );//alert service for set title

    var obj = this;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
      if(response){
        if(response['user'] && response['user']['id']){
            if(this.dataService.hasSchoolId()){
              this.school_id = this.dataService.hasSchoolId();
              this.getClassList();
            }else{
              return obj.router.navigate(['/login']);
            }
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
  * Get Class List 
  */
  getClassList(){
    if(this.school_id){
      this.class_list_array=[];
      this.restApiService.getData('classroom/school/'+this.school_id,(response)=>{
        if(response && Array.isArray(response) && response.length>0){
          response.forEach(element => {
            if(element && element.id){
              var check_id=this.class_list_array.filter((details)=>{ return details.id === element.id; });
              if(check_id.length==0){
                if(element['defaultSnapId']){
                  this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                    if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                      element['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                    }
                  });
                }else{
                  element['staticDpImg']='';
                }
                this.class_list_array.push(element);
              }
            }
          });
        }
      });
    }
  }

  /* 
  * Angular default life cycle method 
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }

  /*
  * default Angular Destroy Method
  */
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /*
  * Upating default images for user picture
  */
  updateDefaultImageUrl(event){
    this.helperService.updateDefaultImageUrlHelper(event);
  }

}
