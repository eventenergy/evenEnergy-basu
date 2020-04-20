import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MouseEvent } from '@agm/core';
import { Subject } from 'rxjs';
import { RestAPIService, AuthenticationService, DataService, AlertService } from 'src/app/_services';
import { HelperService } from 'src/app/_helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AWS_DEFAULT_LINK } from 'src/app/config';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-event-preview',
  templateUrl: './event-preview.component.html',
  styleUrls: ['./event-preview.component.scss'],
  providers: [DatePipe],
})
export class EventPreviewComponent implements OnInit {
  private unsubscribe$ = new Subject();
  nav_links = new Array<{text: string,click: string, click_params:any}>();
  story_id:number;
  user_id:number;
  @ViewChild('story_content') story_content:ElementRef;
  multiple_file_array=new Array();
  story_array=new Array();
  marker = new Array();
  // google maps zoom level
  zoom: number = 12;
  story_background_color:string="#ffffff";
  // initial center position for the map
  lat: number = 12.9542944;
  lng: number = 77.4905086;
  markers: marker[];

  ticket_count_number_array = new Array(0,1,2,3,4,5,6,7,8,9,10);
  ticket_price_with_details_array = new Array();

  default_story_popup_details = new Array();
  story_school_error_status = false;
  story_type_error_status = false;
  story_created_date_error_status = false;
  story_expiry_date_error_status = false;
  story_created_by_role:string;
  story_creation_popup_error= false;
  story_school_array = new Array();

  story_type_admin_parent_status = false;

   /* user story Created date */
   user_story_created_date:any=new Date();

   /* user story expiry date */
   user_story_expiry_date:any=new Date();
   story_date_status = false;
   story_expiry_date_status = false;
   disable_select_school = true;

   story_type_array = new Array();

  constructor(
    private sanitizer: DomSanitizer, 
    public route:ActivatedRoute,
    private restApiService: RestAPIService,
    private authenticateService: AuthenticationService,
    private dataService: DataService,
    private helperService : HelperService,
    private alertService: AlertService,
    private router: Router,
    private datePipe: DatePipe,
  ) { 
  }

  ngOnInit() {
    this.route.paramMap.takeUntil(this.unsubscribe$).subscribe(params=>{
      this.story_id= parseInt(params.get('id'));
      if(!isNaN(this.story_id)){
        var obj = this;
        obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
          if(response){
            if(response['user'] && response['user']['id']){
              obj.user_id = response['user']['id'];
              obj.showPreviewDetails();
              this.story_type_array.push({type:'COMMUNITY_POST', display:'BLOG POST', isChecked:false});
              // this.story_type_array.push({type:'LEARNING_NOTE', display:'CHILD NOTE', isChecked:false});
              this.story_type_array.push({type:'ADVERTISEMENT', display:'SCHEDULE AN EVENT', isChecked:false});
            }else{
              return obj.router.navigateByUrl('/login');
            }
          }else{
            if(localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')){
              obj.authenticateService.checkExpiryStatus();
            }
            return obj.router.navigate(['/login']);
          }
        });
      }else{
        return obj.helperService.goBack();
      }
    });
  }

   /* Date Pipe to change to specific format */
  transformDateViewFormat(date){
    date = new Date(date);
    return this.datePipe.transform(date, "dd/MM/yyyy"); //whatever format you need. 
  }

   /* Date Pipe to change format */
  transformDateChange(date) {
    return this.datePipe.transform(date, "dd/MM/yyyy"); //whatever format you need. 
  }

  /* Date Picker Event */
  onChangeDatePickerStart(event: any, type) {
    if(event && type){
      if(type=='created'){
        this.user_story_created_date=event;
      }else if(type=='expiry'){
        this.user_story_expiry_date=event;
      }
    }
  }

    /*
    * Function to show preview details
    */
    showPreviewDetails(){
      if(this.story_id){
        this.restApiService.getData('story/detailed/'+this.story_id,(response)=>{
          if(response && response.id){
              let story = response;
              if(story.createdUser && story.createdUser && story.createdUser.id == this.user_id){
                this.nav_links.push({text:'Edit', click:'editActivityPopup',click_params:{'story_id':this.story_id,'school_id':story.schoolId,'story_type':story.type,'user_story_created_date': new Date(story.userCreatedAt), 'user_story_expiry_date':(story.expireAt ? new Date(story.expireAt) : story.expireAt)}});
              }
              if(story.caption!='' && story.caption){
                story.caption=this.sanitizer.bypassSecurityTrustHtml(story.caption);
              }
              this.restApiService.getData('user/'+story.userId,(user_response)=>{
                if(user_response && user_response.id && user_response.userProfile){
                  try{
                    if(user_response.userProfile['defaultSnapId']){
                      this.restApiService.getData('snap/'+user_response.userProfile['defaultSnapId'],(snap_details_response)=>{
                        if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                          story['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                        }
                      });
                    }else{
                      story['staticDpImg']=false;
                    }
                    story['createrFirstName']=user_response.userProfile.firstName;
                    story['createrLastName']=user_response.userProfile.lastName;
                  }catch(e){}
                }
              });
              if(response.veneus && Array.isArray(response.veneus) && response.veneus.length > 0){
                response.veneus.forEach((address_element,key) => {
                  if(address_element && key==0){
                    this.lat = address_element.lat;
                    this.lng =  address_element.lng;
                    this.markers = [{
                        lat: this.lat,
                        lng: this.lng,
                        label: 'A',
                        draggable: true
                      }];
                  }
                });
              }

              this.story_content.nativeElement.innerHTML=this.sanitizer.bypassSecurityTrustHtml(story.text);
              var container= this.story_content.nativeElement.querySelectorAll('div');
              var container_main_array = Array.prototype.slice.call(container);
              let image_count = 1;
              container_main_array.forEach(main_element=>{
                if(main_element.getAttribute("name") == "text"){
                  if(main_element.innerText){
                    try {
                      var text_value = JSON.parse(main_element.innerText);
                      if(text_value && text_value.title && text_value.content){
                        this.multiple_file_array.push({type:'text_file',title:this.sanitizer.bypassSecurityTrustHtml(text_value.title),description:this.sanitizer.bypassSecurityTrustHtml(text_value.content)});
                      }
                    } catch (e) {
                        return false;
                    }
                  }
                 }



                if(main_element && main_element.style && main_element.style.backgroundColor){
                  this.story_background_color = main_element.style.backgroundColor;
                }
                var container_child_array = Array.prototype.slice.call(main_element.children);
                
                container_child_array.every(child_element=>{
                  // if(child_element.tagName=="P"){
                  //   this.multiple_file_array.push({type:'text_file',text_data:this.sanitizer.bypassSecurityTrustHtml(main_element.innerHTML),text_content:main_element.innerHTML});  
                  // }else 
                  if(child_element.tagName=="IMG"){
                    if(child_element.dataset.src){
                      this.multiple_file_array.push({type:'image_file',image_src:AWS_DEFAULT_LINK+child_element.dataset.src,image_number:image_count});
                      image_count++;
                    }
                  }else if(child_element.tagName=="VIDEO"){
                    if(child_element.dataset.src){
                      this.multiple_file_array.push({type:'video_file',video_src:AWS_DEFAULT_LINK+child_element.dataset.src});
                    }
                  }else if(child_element.tagName=="EMBED"){
                    if(child_element.dataset.src){
                      this.multiple_file_array.push({type:'pdf_file',pdf_src:this.sanitizer.bypassSecurityTrustResourceUrl(AWS_DEFAULT_LINK+child_element.dataset.src+'#view=FitH')});
                    }
                  }else if(child_element.tagName=="AUDIO"){
                    if(child_element.dataset.src){
                      this.multiple_file_array.push({type:'audio_file',audio_src:AWS_DEFAULT_LINK+child_element.dataset.src});
                    }
                  }
                });
              });

              if(story.capacities && Array.isArray(story.capacities) && story.capacities.length > 0){
                story.capacities.forEach((capacities_element,key) => {
                  story.capacities[key]['ticketSelectedCount']=0;
                });
              }
                  // if(response.children && Array.isArray(response.children) && response.children.length>0){
                  //   response.children.forEach(element => {
                  //     if(element && element.id){
                  //       var check_id=this.student_array.filter((child)=>{ child.id == element.id});
                  //       if(check_id.length==0){
                  //         var child=[];
                  //         child['id']=element.id;
                  //         child['firstName']=element.firstName;
                  //         child['lastName']=element.lastName;
                  //         if(element['defaultSnapId']){
                  //           this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                  //             if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                  //               child['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  //             }
                  //           });
                  //         }else{
                  //           child['staticDpImg']=false;
                  //         }
                  //         this.student_array.push(child);
                  //       }
                  //     }
                  //   });
                  // }
                  // Comment Part
                  // story['comment_array']=[];
                  // story['disabledCommentPost']=true;
                  // story['emojiStatus']=false;
                  // story['comment_display_count']=0;
                  // this.restApiService.getData('comment/getByEntity/1/entity/'+story.id,(comment_response)=>{
                  //   if(comment_response && Array.isArray(comment_response) && comment_response.length>0){
                  //     comment_response=comment_response.sort(function(x, y){
                  //       if(x.value && x.value.updatedAt && y.value && y.value.updatedAt)
                  //           return x.value.updatedAt - y.value.updatedAt;

                  //     });
                  //     comment_response.forEach(comment_element => {
                  //       if(comment_element.value && comment_element.value.comment && comment_element.value.user && comment_element.value.user.id && comment_element.value.user.userProfile){
                  //         var comment_details = this.getCommentsDetails(comment_element.value.comment);
                  //         comment_element['value']['disabledChildCommentReply']=true;
                  //         comment_element['value']['replyButtonStatus']=true;
                  //         if(comment_element.value.user.userProfile['defaultSnapId']){
                  //           this.restApiService.getData('snap/'+comment_element.value.user.userProfile['defaultSnapId'],(snap_details_response)=>{
                  //             if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                  //               comment_element['value']['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  //             }
                  //           });
                  //         }else{
                  //           comment_element['value']['staticDpImg']='';
                  //         }
                  //         comment_element['value']['delete_status']=false;
                  //         if(comment_element.value.user.id && this.user_id==parseInt(comment_element.value.user.id)){
                  //           comment_element['value']['delete_status']=true;
                  //         }
                  //         var child_comment_array=[],child_comment_display_count=0;
                  //         if(comment_element.children && Array.isArray(comment_element.children) && comment_element.children.length>0){
                  //           comment_element.children=comment_element.children.sort(function(x, y){
                  //             if(x.value && x.value.updatedAt && y.value && y.value.updatedAt)
                  //                 return x.value.updatedAt - y.value.updatedAt;
        
                  //           });
                  //           comment_element.children.forEach(child_element => {
                  //             if(child_element.value && child_element.value.comment && child_element.value.user && child_element.value.user.id && child_element.value.user.userProfile){
                  //               var child_comment_details = this.getCommentsDetails(child_element.value.comment);
                  //               if(child_element.value.user.userProfile['defaultSnapId']){
                  //                 this.restApiService.getData('snap/'+child_element.value.user.userProfile['defaultSnapId'],(snap_details_response)=>{
                  //                   if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                  //                     child_element['value']['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  //                   }
                  //                 });
                  //               }else{
                  //                 child_element['value']['staticDpImg']='';
                  //               }
                  //               child_element['value']['delete_status']=false;
                  //               if(child_element.value.user.id && this.user_id==parseInt(child_element.value.user.id)){
                  //                 child_element['value']['delete_status']=true;
                  //               }
                  //             }
                  //             var check_child_array=child_comment_array.filter((comments)=> { return comments.id == child_element.value.id});
                  //             if(check_child_array.length==0)
                  //               child_comment_array.push({id:child_element.value.id,result:child_element.value,comment_details:child_comment_details});

                  //               child_comment_display_count = (child_comment_array ? (child_comment_array.length>2 ? (child_comment_array.length - 2) : 0) : 0);
                  //           });
                            
                  //         }
                  //         var check_array=story['comment_array'].filter((comments)=> { return comments.id == comment_element.value.id});
                  //         if(check_array.length==0)
                  //             story['comment_array'].push({id:comment_element.value.id,result:comment_element.value,comment_details:comment_details,child_comment_array:child_comment_array, child_comment_display_count: child_comment_display_count});

                  //       }
                  //       story['comment_display_count']= (story['comment_array'] ? (story['comment_array'].length>2 ? story['comment_array'].length - 2 : 0) : 0);
                  //     });
                  //   }
                  // });
                  // this.restApiService.getData(`story/${this.story_id}/permittedUsers`,(permittedUsers)=>{
                  //   if(permittedUsers && Array.isArray(permittedUsers) && permittedUsers.length>0){
                  //     permittedUsers.forEach(element => {
                  //       if(element && element.id!==permittedUsers['id']){
                  //         var check_id=this.teacher_user_tagged_array.filter((child)=>{ child.id == element.id});
                  //         if(check_id.length==0){
                  //           var user=[];
                  //           user['id']=element.id;
                  //           user['firstName']=element.firstName;
                  //           user['lastName']=element.lastName;
                  //           if(element['defaultSnapId']){
                  //             this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                  //               if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                  //                 user['staticDpImg']=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  //               }
                  //             });
                  //           }else{
                  //             user['staticDpImg']=false;
                  //           }
                  //           this.teacher_user_tagged_array.push(user);
                  //         }
                  //       }
                  //     });
                  //   }
                  // });
                  // story['comment_display_count']= (story['comment_array'] ? (story['comment_array'].length>2 ? story['comment_array'].length - 2 : 0) : 0);
                  this.story_array.push(story);
          }else{
            this.alertService.showNotification('Something went wrong','error');
            this.helperService.goBack();
          }
        });
      }else{
        this.alertService.showNotification('Something went wrong','error');
        this.helperService.goBack();
      }
    }
     
    /*
    * Re directing to get Direction page
    */
    routeToGoogleMaps(){
      if(this.lat && this.lng){
        window.open('https://www.google.com/maps/dir/?api=1&destination='+this.lat+','+this.lng, "_blank");
      }
    }

      ticket_capacity_details_array = new Array();
      onChangeSelectTicketNumber(event,capacity_details){
        if(capacity_details && capacity_details.id){
          var check_index_value = this.ticket_capacity_details_array.findIndex((check_id)=>{ return check_id.id === capacity_details.id; });
          if(check_index_value == -1){
            this.ticket_capacity_details_array.push(capacity_details);
          }else{
            if(typeof this.ticket_capacity_details_array[check_index_value]!== 'undefined'){
              this.ticket_capacity_details_array.splice(check_index_value,1,capacity_details);
            }
          }
        }
        this.calculatePrice(event,capacity_details);
      }

      calculatePrice(selected_ticket_count,details){
        if(details && details.id){
          if(details.serviceCharge && (details.status == "PAID" || details.status == "DONATION") && details.ticketPrice > 0){
            if(details.serviceCharge && details.serviceCharge.name == 'Organizer Pay Both the Fees (3.99%+GST)'){
              var check_index_value = this.ticket_price_with_details_array.findIndex((check_id)=>{ return check_id.capacity_id === details.id; });
              var total_amount = parseFloat((parseFloat(details.ticketPrice) * parseInt(details.ticketSelectedCount)).toFixed(2));
              if(check_index_value == -1){
                this.ticket_price_with_details_array.push({capacity_id:details.id,total_amount:total_amount,gst:0,service_tax:0,payment_gateway_charges:0,GST_on_service_and_payment_charges:0,total_calculated_amount:total_amount})
              }else{
                if(typeof this.ticket_price_with_details_array[check_index_value]!== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id){
                  this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
                  this.ticket_price_with_details_array[check_index_value].gst = 0;
                  this.ticket_price_with_details_array[check_index_value].service_tax = 0;
                  this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = 0;
                  this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = 0;
                  this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_amount;
                }
              }
            }else if(details.serviceCharge && details.serviceCharge.name == 'Customer Pay Both the Fees (3.99% + GST)'){
              var check_index_value = this.ticket_price_with_details_array.findIndex((check_id)=>{ return check_id.capacity_id === details.id; });
              let total_amount = parseFloat((parseFloat(details.ticketPrice) *  parseInt(details.ticketSelectedCount) ).toFixed(2));
              let GST = parseFloat(((18/100) * total_amount).toFixed(2));
              let service_tax = parseFloat(((2/100) * (total_amount + GST)).toFixed(2));
              let payment_gateway_charges = parseFloat(((1.99/100) * (total_amount + GST)).toFixed(2));
              let GST_on_service_and_payment_charges = parseFloat(((18/100) * (service_tax + payment_gateway_charges)).toFixed(2));
              let total_calculated_amount = parseFloat((total_amount + GST + service_tax + payment_gateway_charges + GST_on_service_and_payment_charges).toFixed(2));
              if(check_index_value == -1){
                this.ticket_price_with_details_array.push({capacity_id:details.id,total_amount:total_amount,gst:GST,service_tax:service_tax,payment_gateway_charges:payment_gateway_charges,GST_on_service_and_payment_charges:GST_on_service_and_payment_charges,total_calculated_amount:total_calculated_amount})
              }else{
                if(typeof this.ticket_price_with_details_array[check_index_value]!== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id){
                  this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
                  this.ticket_price_with_details_array[check_index_value].gst = GST;
                  this.ticket_price_with_details_array[check_index_value].service_tax = service_tax;
                  this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = payment_gateway_charges;
                  this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = GST_on_service_and_payment_charges;
                  this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_calculated_amount;
                }
              }
            }else if(details.serviceCharge && details.serviceCharge.name =="Pass Payment Gateway Fee to Customer (1.99% + GST)"){
              var check_index_value = this.ticket_price_with_details_array.findIndex((check_id)=>{ return check_id.capacity_id === details.id; });
              let total_amount = parseFloat((parseFloat(details.ticketPrice) *  parseInt(details.ticketSelectedCount) ).toFixed(2));
              let GST = parseFloat(((18/100) * total_amount).toFixed(2));
              let payment_gateway_charges = parseFloat(((1.99/100) * (total_amount + GST)).toFixed(2));
              let GST_on_service_and_payment_charges = parseFloat(((18/100) * (payment_gateway_charges)).toFixed(2));
              let total_calculated_amount = parseFloat((total_amount + GST + payment_gateway_charges + GST_on_service_and_payment_charges).toFixed(2));
              if(check_index_value == -1){
                this.ticket_price_with_details_array.push({capacity_id:details.id,total_amount:total_amount,gst:GST,service_tax:0,payment_gateway_charges:payment_gateway_charges,GST_on_service_and_payment_charges:GST_on_service_and_payment_charges,total_calculated_amount:total_calculated_amount})
              }else{
                if(typeof this.ticket_price_with_details_array[check_index_value]!== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id){
                  this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
                  this.ticket_price_with_details_array[check_index_value].gst = GST;
                  this.ticket_price_with_details_array[check_index_value].service_tax = 0;
                  this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = payment_gateway_charges;
                  this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = GST_on_service_and_payment_charges;
                  this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_calculated_amount;
                }
              }
            }else if(details.serviceCharge && details.serviceCharge.name =="Pass Service Charge to Customer (2% + GST)"){
              var check_index_value = this.ticket_price_with_details_array.findIndex((check_id)=>{ return check_id.capacity_id === details.id; });
              let total_amount = parseFloat((parseFloat(details.ticketPrice) *  parseInt(details.ticketSelectedCount) ).toFixed(2));
              let GST = parseFloat(((18/100) * total_amount).toFixed(2));
              let service_tax = parseFloat(((2/100) * (total_amount + GST)).toFixed(2));
              let GST_on_service_and_payment_charges = parseFloat(((18/100) * (service_tax)).toFixed(2));
              let total_calculated_amount = parseFloat((total_amount + GST + service_tax + GST_on_service_and_payment_charges).toFixed(2));
              if(check_index_value == -1){
                this.ticket_price_with_details_array.push({capacity_id:details.id,total_amount:total_amount,gst:GST,service_tax:service_tax,payment_gateway_charges:0,GST_on_service_and_payment_charges:GST_on_service_and_payment_charges,total_calculated_amount:total_calculated_amount})
              }else{
                if(typeof this.ticket_price_with_details_array[check_index_value]!== 'undefined' && this.ticket_price_with_details_array[check_index_value].capacity_id == details.id){
                  this.ticket_price_with_details_array[check_index_value].total_amount = total_amount;
                  this.ticket_price_with_details_array[check_index_value].gst = GST;
                  this.ticket_price_with_details_array[check_index_value].service_tax = service_tax;
                  this.ticket_price_with_details_array[check_index_value].payment_gateway_charges = 0;
                  this.ticket_price_with_details_array[check_index_value].GST_on_service_and_payment_charges = GST_on_service_and_payment_charges;
                  this.ticket_price_with_details_array[check_index_value].total_calculated_amount = total_calculated_amount;
                }
              }
            }
          }
          this.showTicketInformation(()=>{});
        }
      }

      ticket_information_details = new Array();
      // ticket_information_details = new Array({'total_amount':0,'gst':0,'service_tax':0,'internet_handling_fee_total':0,'payment_gateway_charges':0,'GST_on_service_and_payment_charges':0,'total_calculated_amount':0});
      showTicketInformation(callback){
        this.ticket_information_details = new Array({'total_amount':0,'gst':0,'service_tax':0, 'internet_handling_fee_total':0,'payment_gateway_charges':0,'GST_on_service_and_payment_charges':0,'total_calculated_amount':0});
        this.ticket_price_with_details_array.forEach((element,key) => {
          if(element && element.capacity_id){
            this.ticket_information_details[0]['total_amount']+= parseFloat((element.total_amount).toFixed(2));
            this.ticket_information_details[0]['gst']+= parseFloat((element.gst).toFixed(2));
            this.ticket_information_details[0]['internet_handling_fee_total']+= parseFloat((element.service_tax).toFixed(2)) + parseFloat((element.payment_gateway_charges).toFixed(2)) + parseFloat((element.GST_on_service_and_payment_charges).toFixed(2));
            this.ticket_information_details[0]['service_tax']+= parseFloat((element.service_tax).toFixed(2));
            this.ticket_information_details[0]['payment_gateway_charges']+= parseFloat((element.payment_gateway_charges).toFixed(2));
            this.ticket_information_details[0]['GST_on_service_and_payment_charges']+= parseFloat((element.GST_on_service_and_payment_charges).toFixed(2));
            this.ticket_information_details[0]['total_calculated_amount']+= parseFloat((element.total_calculated_amount).toFixed(2));
            
            this.ticket_information_details[0]['total_amount'] = parseFloat(this.ticket_information_details[0]['total_amount'].toFixed(2));
            this.ticket_information_details[0]['gst'] = parseFloat(this.ticket_information_details[0]['gst'].toFixed(2));
            this.ticket_information_details[0]['internet_handling_fee_total'] = parseFloat(this.ticket_information_details[0]['internet_handling_fee_total'].toFixed(2));
            this.ticket_information_details[0]['service_tax'] = parseFloat(this.ticket_information_details[0]['service_tax'].toFixed(2));
            this.ticket_information_details[0]['payment_gateway_charges'] = parseFloat(this.ticket_information_details[0]['payment_gateway_charges'].toFixed(2));
            this.ticket_information_details[0]['GST_on_service_and_payment_charges'] = parseFloat(this.ticket_information_details[0]['GST_on_service_and_payment_charges'].toFixed(2));
            this.ticket_information_details[0]['total_calculated_amount'] = Math.round(parseFloat(this.ticket_information_details[0]['total_calculated_amount'].toFixed(2)));
          }
        });
        return callback && callback(true);
      }


      bookTicketWithRequiredQuantity(){
        if(this.ticket_capacity_details_array && Array.isArray(this.ticket_capacity_details_array) && this.ticket_capacity_details_array.length > 0){
          let event_booking_details = [];
          this.ticket_capacity_details_array.forEach(element => {
              if(element && element.id){
                var check_index_value = event_booking_details.findIndex((check_id)=>{ return check_id.capacityId === element.id; });
                if(check_index_value == -1){
                  if(element.ticketSelectedCount)
                    event_booking_details.push({"capacityId":element.id,"reqCapacity":element.ticketSelectedCount,"curCapacity":0});
                }else{
                  if(typeof event_booking_details[check_index_value]!== 'undefined' && event_booking_details[check_index_value].capacityId == element.id){
                    if(element.ticketSelectedCount){
                      event_booking_details[check_index_value].reqCapacity = element.ticketSelectedCount;
                    }else{
                      event_booking_details.splice(check_index_value,1);
                    }
                  }
                }
              }
          });
          let total_amount = 0;
          this.showTicketInformation((response)=>{
            if(response){
              if(this.ticket_information_details && Array.isArray(this.ticket_information_details) && this.ticket_information_details.length > 0){
                this.ticket_information_details.forEach((element,key) => {
                  if(element && element.total_calculated_amount){
                    total_amount = element.total_calculated_amount;
                  }
                });
                if(event_booking_details && Array.isArray(event_booking_details) && event_booking_details.length > 0){
                  var book_ticket_details = {
                    "amount": Math.round(total_amount) * 100,
                    "currency":"INR",
                    "receipt":"Event"+this.story_id,
                    "paymentCapture":1,
                    "eventBookingDetail":event_booking_details,
                    "message":"Event Ticket Booking"
                  }
                  this.restApiService.postAPI('order/bookOrder',book_ticket_details,(response)=>{
                    if(response && response.success && response.orderId){
                      localStorage.removeItem('event_total_amount_details');
                      localStorage.setItem('event_total_amount_details',JSON.stringify(this.ticket_information_details));
                      return this.router.navigate(['event/payment-registration/'+response.orderId]);
                    }else if(response && !response.success){
                      this.alertService.showNotification('Something went wrong','error');
                    }
                  });
                }
              }
            }
          })
        }
      }

      /*
      * Function to edit story
      */
      editActivityPopup(story_details){
        this.default_story_popup_details.length = 0;
        this.default_story_popup_details.push(story_details)
        $('#alert_edit_story_popup').modal('show');
      }

      /*
      * route to story edit page
      */
      editStory(){
        if(this.default_story_popup_details && Array.isArray(this.default_story_popup_details) && this.default_story_popup_details.length == 1){
          this.default_story_popup_details.forEach(story_element => {
            if(story_element.story_id && story_element.school_id && story_element.story_type && story_element.user_story_created_date){
              $('#alert_edit_story_popup').modal('hide');
              if(story_element.story_type != 'CONVERSATION'){
                this.createStoryPopup((popup_response)=>{
                  if(popup_response){
                    this.storySelectSchool(story_element.school_id,(response)=>{
                      if(response){
                        this.storySelectStoryType(story_element.story_type,(select_story_response)=>{
                          if(select_story_response){
                            if(story_element.user_story_created_date){
                              // this.user_story_created_date = this.transformDateViewFormat(story_element.user_story_created_date);
                              this.user_story_created_date = story_element.user_story_created_date;
                            }
                            if(story_element.story_type=='ADVERTISEMENT' && story_element.user_story_expiry_date){
                              // this.user_story_expiry_date = this.transformDateViewFormat(story_element.user_story_expiry_date);
                              this.user_story_expiry_date = story_element.user_story_expiry_date;
                            }
                            this.disable_select_school = true;
                          }
                        });
                      }
                    });
                  }
                });
              }else{
                this.alertService.showNotification('Conversation story can\'t be edited');
              }
            }else{
              this.alertService.showNotification('Something went wrong');
            }
          });
        }
      }

        /*
        * create story function to parent, teacher and admin
        */
      createStoryPopup(callback){
        localStorage.removeItem('story_creation_type_details');
        this.story_school_array.length=0;
        this.story_type_admin_parent_status= false;
        this.story_date_status = false;
        this.story_expiry_date_status = false;

        this.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response)=>{
          if(response && response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length>0){
            response['schoolDetail'].forEach(element => {
              if(element.school.id && element.school.name && element.role){
                var check_id=this.story_school_array.filter((details)=>{ return details.id === element.school.id});
                if(check_id.length==0){
                  let staticSchoolDpImg='';
                  if(element['defaultSnapId']){
                    this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                      if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                        staticSchoolDpImg=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                      }
                    });
                  }
                  this.story_school_array.push({id: element.school.id,name: element.school.name, role: element.role, staticSchoolDpImg:staticSchoolDpImg, isChecked: false})
                }
              }
            });
            $('#create_story_popup').modal('show');
            return callback && callback(true);
          }
        });
      }

      /*
      * Function to select the school
      * while creating the story
      */
      private storySelectSchool(school_id,callback){
        this.story_type_admin_parent_status = false;
        this.story_date_status = false;
        this.story_expiry_date_status = false;
        
        this.story_school_array.forEach(element => {
          if(element.id!==school_id){
            element.isChecked = false;
          }
        });

        var check_id=this.story_school_array.filter((details)=>{ return details.id === parseInt(school_id) && details.isChecked === true});
        if(check_id.length==0){
            var index_value= this.story_school_array.findIndex(obj => obj.id==parseInt(school_id));
            if(index_value>-1){
              if(typeof this.story_school_array[index_value] !== 'undefined') {
                this.story_school_array[index_value]['isChecked']=true;
              }
            }
        }else{
            var index_value= this.story_school_array.findIndex(obj => obj.id==parseInt(school_id));
            if(index_value>-1){
              if(typeof this.story_school_array[index_value] !== 'undefined') {
                this.story_school_array[index_value]['isChecked']=false;
              }
            }
        }
        this.story_type_array.forEach(element => {
          element.isChecked = false;
        });

        var check_id_selected=this.story_school_array.filter((details)=>{ return details.id === parseInt(school_id) && details.isChecked === true});
        if(check_id_selected.length>0){
          if(check_id_selected && Array.isArray(check_id_selected)){
            check_id_selected.forEach(element => {
              if(element && element.role && Array.isArray(element.role) && element.role.length>0){
                var index_value= element.role.findIndex(obj => obj == 'ADMIN' || obj == 'TEACHER');
                if(index_value>-1){
                  this.story_type_admin_parent_status= true;
                }
                if(!this.story_type_admin_parent_status){
                  var parent_check_index_value= element.role.findIndex(obj => obj == 'PARENT');
                  if(parent_check_index_value>-1){
                    this.story_created_by_role = 'PARENT';
                    this.story_date_status = true;
                    this.story_type_array.forEach(element=>{
                      if(element.type=='STORY'){
                        element.isChecked = true;
                      }
                    })
                  }
                }
                var admin_check_index_value= element.role.findIndex(obj => obj == 'ADMIN');
                if(admin_check_index_value>-1){
                  this.story_created_by_role='ADMIN';
                }

                if(this.story_created_by_role!='ADMIN' &&  this.story_created_by_role!='PARENT'){
                  var teacher_check_index_value= element.role.findIndex(obj => obj == 'TEACHER');
                  if(teacher_check_index_value>-1){
                    this.story_created_by_role='TEACHER';
                  }
                }

              }
            });
          }
        }
        return callback && callback(true);
      }

      /*
      * Function to select the story type
      * while creating the story
      */
      storySelectStoryType(type,callback){
        this.story_date_status = false;
        this.story_expiry_date_status = false;

        this.story_type_array.forEach(element => {
          if(element.type!==type){
            element.isChecked = false;
          }
        });

        var check_id=this.story_type_array.filter((details)=>{ return details.type === type && details.isChecked === true});
        if(check_id.length==0){
          var index_value= this.story_type_array.findIndex(obj => obj.type == type);
          if(index_value>-1){
            if(typeof this.story_type_array[index_value] !== 'undefined') {
              this.story_type_array[index_value]['isChecked']=true;
            }
          }
        }else{
          var index_value= this.story_type_array.findIndex(obj => obj.type == type);
          if(index_value>-1){
            if(typeof this.story_type_array[index_value] !== 'undefined') {
              this.story_type_array[index_value]['isChecked']=true;
            }
          }
        }
        
        var check_id_selected=this.story_type_array.filter((details)=>{ return details.type === type && details.isChecked === true});
        if(check_id_selected.length>0){
          if(check_id_selected && Array.isArray(check_id_selected)){
            this.story_date_status=true;
            this.user_story_created_date=new Date();
          }
        }

        if(type=='ADVERTISEMENT'){
          this.story_expiry_date_status = true ;
          this.user_story_expiry_date=new Date();
        }
        return callback && callback(true);
      }

      /*
      * Function to save all story details
      */
      saveStoryPopupDetails(){
        this.story_creation_popup_error= false;
        this.story_school_error_status = false;
        this.story_type_error_status = false;
        this.story_created_date_error_status = false;
        this.story_expiry_date_error_status = false;
        var school_id=0,story_type='';

        if(this.story_school_array && Array.isArray(this.story_school_array) && this.story_school_array.length>0){
          this.story_school_array.forEach(element => {
            if(element && element.isChecked){
              school_id= element.id;
            }
          });
        }
        if(!school_id){
          this.story_school_error_status = true;
          return false;
        }

        if(this.story_type_array && Array.isArray(this.story_type_array) && this.story_type_array.length>0){
          this.story_type_array.forEach(element => {
            if(element && element.isChecked){
              story_type= element.type;
            }
          });
        }
        if(!story_type){
          this.story_type_error_status = true;
          return false;
        }
        if(!this.user_story_created_date){
          this.story_created_date_error_status = true;
          return false;
        }
        if(story_type && story_type=='ADVERTISEMENT' && !this.user_story_expiry_date){
          this.story_expiry_date_error_status = true;
          return false;
        }

        if(school_id && story_type && this.user_story_created_date && this.story_created_by_role && this.story_id){
          if(story_type=='ADVERTISEMENT' && !this.user_story_expiry_date){
            this.story_creation_popup_error= true;
            return false;
          }
          var story_creation_type_details = {'school_id':school_id,'story_type':story_type,'story_created_date':this.user_story_created_date, 'story_created_by_role': this.story_created_by_role, 'story_expiry_date':this.user_story_expiry_date};
          localStorage.setItem('story_creation_type_details', JSON.stringify(story_creation_type_details));
          localStorage.setItem('story_details',JSON.stringify({'story_id':this.story_id}));
          $('#create_story_popup').modal('hide');
          return this.router.navigateByUrl('/story/create/new');
        }else{
          this.story_creation_popup_error= true;
          return false;
        }
      }

    /*
    * Default Angular Destroy Method
    */
    ngOnDestroy() {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }



}
interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}