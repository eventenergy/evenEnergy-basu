import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthenticationService, NavbarService, RestAPIService, DataService } from '../../_services';
import { AWS_DEFAULT_LINK } from '../../config';
import { Subject } from 'rxjs';
import { HelperService } from '../../_helpers';
declare let $: any;

@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrls: ['./menu-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MenuSidebarComponent implements OnInit {
  private unsubscribe$ = new Subject();
  // loggedUserName:string;
  /* Menu bar required elements */
  menuLinks= new Array<{ id: string, text: string, path: string, staticDpImg: string, image_text: string, font_icon:string, real_id:any ,sub_menu:Array<{id: string, text: string, path: string, sub_menu_1:Array<{text: string, path: string}>}>}>();
  user_id: number;  
  menubar_school_array= new Array();
  routerLinkActive:any;

  constructor(
    private router:Router,
    private location: Location,
    private navbarService: NavbarService,
    private authenticateService: AuthenticationService,
    private restApiService: RestAPIService,
    private dataService: DataService,
    private helperService: HelperService
  ) {
  }

  /* 
  * Angular default life cycle method
  */
  ngOnInit() {
    this.navbarService.clearAllMenuSidebarItems();
    this.navbarService.addMenuSidebarItem({id:'latest_activity', text:'Latest Activity', path: '/activity', staticDpImg: '', image_text: 'LA', font_icon: '<i class="fa fa-home"></i>', real_id: 'activity', sub_menu:[]});
    this.menuBarResponsiveFunction();
    document.addEventListener("click",(e)=>{
      if($('#hideMenu')[0] && $('#navigation-menu')[0]){
        if(!document.getElementById('hideMenu').contains(<Element>e.target) && !document.getElementById('navigation-menu').contains(<Element>e.target)){
          this.helperService.closeMenuIcon();
        }
      }
    },false);
    var obj = this;
    var response;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((result)=>{
      this.menuLinks.length = 0;
      response=result;
      if(response){
        if(response['user'] && response['user']['id']){
          obj.user_id = response['user']['id'];

          // logged user name display start
          // if(response.user.userProfile){
          //   var loggedUserName=response.user.userProfile.firstName+" "+response.user.userProfile.lastName;
          //   let staticDpImg='';
          //   if(response.user.userProfile['defaultSnapId']){
          //     this.navbarService.addMenuSidebarItem({id:'logged_user', text: loggedUserName, path: null, staticDpImg:staticDpImg, image_text: '', font_icon: '<i class="fa fa-user-circle-o"></i>', real_id:'user', sub_menu:[{id:'user_profile', text: 'Attendee View', path:'/user/profile/current-ticket', sub_menu_1:[]},{id:'invites', text: 'Invites', path:'/user/invites', sub_menu_1:[]}]});
          //     this.restApiService.getData('snap/'+response.user.userProfile['defaultSnapId'],(snap_details_response)=>{
          //       if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
          //         staticDpImg=AWS_DEFAULT_LINK+snap_details_response.imgPath;
          //         this.navbarService.addMenuSidebarItem({id:'logged_user', text: loggedUserName, path: null, staticDpImg:staticDpImg, image_text: '', font_icon: '<i class="fa fa-user-circle-o"></i>', real_id:'user', sub_menu:[{id:'user_profile', text: 'Attendee View', path:'/user/profile/current-ticket', sub_menu_1:[]},{id:'invites', text: 'Invites', path:'/user/invites', sub_menu_1:[]}]});
          //       }
          //     });
          //   }else{
          //     this.navbarService.addMenuSidebarItem({id:'logged_user', text: loggedUserName, path: null, staticDpImg:staticDpImg, image_text: '', font_icon: '<i class="fa fa-user-circle-o"></i>', real_id:'user', sub_menu:[{id:'user_profile', text: 'Attendee View', path:'/user/profile/current-ticket', sub_menu_1:[]},{id:'invites', text: 'Invites', path:'/user/invites', sub_menu_1:[]}]});
          //   }
          // } 
          // logged user name display end
          if(response.user.superAdmin){
            this.navbarService.addMenuSidebarItem({id:'super_admin_approvals', text:'Approvals', path: '/super-admin/approvals', staticDpImg: '', image_text: 'SA', font_icon: '<i class="fa fa-home"></i>', real_id: 'super_admin_approvals', sub_menu:[]});
          }
          if(response.user.superAdmin){
            this.navbarService.addMenuSidebarItem({id:'super_admin_past_approvals', text:'Past Approvals', path: '/super-admin/past-approvals', staticDpImg: '', image_text: 'SA', font_icon: '<i class="fa fa-home"></i>', real_id: 'super_admin_past_approvals', sub_menu:[]});
          }
          if(response.user.userProfile){
            let staticDpImg='';
            if(response.user.userProfile['defaultSnapId']){
              this.navbarService.addMenuSidebarItem({id:'logged_user', text: 'My Tickets', path: null, staticDpImg:staticDpImg, image_text: '', font_icon: '<i class="fa fa-ticket"></i>', real_id:'user', sub_menu:[{id:'user_profile', text: 'Current Tickets', path:'/user/profile/orders/current', sub_menu_1:[]},{id:'user_profile', text: 'Past Tickets', path:'/user/profile/orders/past', sub_menu_1:[]} ]});
              this.restApiService.getData('snap/'+response.user.userProfile['defaultSnapId'],(snap_details_response)=>{
                if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                  staticDpImg=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                  this.navbarService.addMenuSidebarItem({id:'logged_user', text: 'My Tickets', path: null, staticDpImg:staticDpImg, image_text: '', font_icon: '<i class="fa fa-ticket"></i>', real_id:'user', sub_menu:[{id:'user_profile', text: 'Current Tickets', path:'/user/profile/orders/current', sub_menu_1:[]},{id:'user_profile', text: 'Past Tickets', path:'/user/profile/orders/past', sub_menu_1:[]} ]});
                }
              });
            }else{
              this.navbarService.addMenuSidebarItem({id:'logged_user', text: 'My Tickets', path: null, staticDpImg:staticDpImg, image_text: '', font_icon: '<i class="fa fa-ticket"></i>', real_id:'user', sub_menu:[{id:'user_profile', text: 'Current Tickets', path:'/user/profile/orders/current', sub_menu_1:[]},{id:'user_profile', text: 'Past Tickets', path:'/user/profile/orders/past', sub_menu_1:[]} ]});
            }
          }

          if(response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length>0){
            obj.menubar_school_array=[];
            response.schoolDetail.forEach(element => {
              if(element.school.id && element.school.name && element.role){
                var check_id=obj.menubar_school_array.filter((details)=>{ return details.id === element.school.id});
                if(check_id.length==0){
                  var staticSchoolDpImg='';
                  if(element['defaultSnapId']){
                    this.restApiService.getData('snap/'+element['defaultSnapId'],(snap_details_response)=>{
                      if(snap_details_response && snap_details_response.id && snap_details_response.imgPath){
                        staticSchoolDpImg=AWS_DEFAULT_LINK+snap_details_response.imgPath;
                      }
                    });
                  }
                  if(element.role.includes('ADMIN') || element.role.includes('TEACHER') ){
                    obj.menubar_school_array.push({id: element.school.id,name: element.school.name, role: element.role, staticSchoolDpImg:staticSchoolDpImg})
                  }
                }
              }
            });
            this.navbarService.addMenuSidebarItem({id:'draft_stories', text:'Draft Events', path: '/stories/draft', staticDpImg: '', image_text: 'DS', font_icon: '<i class="fa fa-sticky-note"></i>', real_id:'draft', sub_menu:[]});
            this.navbarService.addMenuSidebarItem({id:'pending_stories', text:'Pending Events', path: '/stories/pending', staticDpImg: '', image_text: 'DS', font_icon: '<i class="fa fa-sticky-note"></i>', real_id:'pending', sub_menu:[]});
            this.navbarService.addMenuSidebarItem({id:'approved_stories', text:'Approved Events', path: '/stories/approved', staticDpImg: '', image_text: 'DS', font_icon: '<i class="fa fa-sticky-note"></i>', real_id:'approved', sub_menu:[]});
            if(obj.menubar_school_array && obj.menubar_school_array.length>0){
              obj.addSchoolToMenuSidebar();
            }
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
    this.menuLinks = this.navbarService.getMenuSidebarLinks();
  }

  /* 
  * Add School and Roles to Menu Bar
  */
  addSchoolToMenuSidebar(){
    if(this.menubar_school_array && Array.isArray(this.menubar_school_array) && this.menubar_school_array.length>0){
      this.menubar_school_array.forEach(element => {
        var sub_menu_array=[];
        var school_name='';
        if(element.name){
          school_name = 'dashboard_'+ element.id;
        }
        if(element.role && Array.isArray(element.role) && element.role.length>0){
          element.role.sort().every(role_element => {
            if(role_element === 'ADMIN'){
              sub_menu_array.push({id:"a_"+school_name+"_"+role_element, text:'Dashboard', path:null,
              sub_menu_1:[{text: 'Events', path: null, click: 'routeToRespectiveClick', schoolId:element.id, user_id: this.user_id, role_name: 'ADMIN', action_type:'admin_dashboard' },
              {text: 'Memebers', path: null, click: 'routeToRespectiveClick', schoolId:element.id, user_id: this.user_id, role_name: 'ADMIN', action_type:'admin_members'},
              {text: 'Admin', path: null, click: 'routeToRespectiveClick', schoolId:element.id, user_id: this.user_id, role_name: 'ADMIN', action_type:'admin_Admin'}]
            })
            return false
            }
            else
            if(role_element === 'TEACHER'){
                sub_menu_array.push({id:"t_"+school_name+"_"+role_element, text:'Dashboard', path:null,
                  sub_menu_1:[{text: 'Events', path: null, click: 'routeToRespectiveClick', schoolId:element.id, user_id: this.user_id, role_name: 'TEACHER', action_type:'teacher_dashboard' }]
                })
                return true;
            }
            else 
            if(role_element === 'PARENT'){
              var check_admin_teacher_index = element.role.findIndex((obj)=>{ return obj == 'TEACHER' || obj == 'ADMIN'});
              if(check_admin_teacher_index==-1){
                sub_menu_array.push({id:"p_"+school_name+"_"+role_element, text:'Profile', path:'/user/school/profile', query_id:element.id,
                                    sub_menu_1:[]})
              }
              return true;
            }
          });
        }
        this.navbarService.addMenuSidebarItem({id:"school_"+element.id, text: element.name, path: null, staticDpImg:element.staticSchoolDpImg, image_text: '', font_icon: '<i class="fa fa-university"></i>', real_id:element.id, sub_menu:sub_menu_array});
      });
    }
  }

  /* 
  * Change School details and route to respective url based on action type
  */
  private routeToRespectiveClick(user_id,school_id,role_name,action_type){
    if(user_id && school_id && role_name && action_type){
      this.dataService.changeUserId(user_id);
      this.dataService.changeSchoolId(school_id);
      this.dataService.changeRole(role_name);
      if(action_type=='admin_dashboard'){
        return this.router.navigate(['/admin/organization'],{queryParams:{refresh: new Date().getTime()}});
      } else if(action_type=='admin_members'){
        return this.router.navigate(['/admin/organization/member'],{queryParams:{refresh: new Date().getTime()}});
      } else if(action_type=='admin_Admin'){
        return this.router.navigate(['/admin/organization/admin'],{queryParams:{refresh: new Date().getTime()}});
      }
      else if(action_type=='admin_approvals'){
        return this.router.navigate(['/admin/organization/activity/approvals'],{queryParams:{refresh: new Date().getTime()}});
      }else if(action_type=='teacher_dashboard'){
        return this.router.navigate(['/member/organization'],{queryParams:{refresh: new Date().getTime()}});
      }
    }
  }

  /* 
  * Menu bar Responsive show hide function
  */
  menuBarResponsiveFunction(){
    $(document).ready(function(){
      var windowHeight = window.innerHeight;
      $('#navigation-menu').css('height','100%');
      
      $(document).on('click', '#showMenu', function(){
        $('#navigation-menu').css('left', '0');
        $('#showMenu, #hideMenu').css('left', '280px');
        $('#showMenu, #hideMenu').html('<i class="fa fa-chevron-left"></i>');
        $('#showMenu').attr('id', 'hideMenu');
      });
    
      $(document).on('click', '#hideMenu', function(){
        $('#navigation-menu').css('left', '-280px');
        $('#showMenu, #hideMenu').css('left', '0');
        $('#showMenu, #hideMenu').html('&#9776;&nbsp;Menu');
        $('#hideMenu').attr('id', 'showMenu');
      });
    });
  }

  /* 
  * Menu bar open submenu function
  */
  openSubMenu(event,id){
    if(document.querySelector('#'+id) && document.querySelector('#'+id).classList.contains('in')){
      document.querySelector('#'+id).classList.remove('in');
    }else if(document.querySelector('#'+id)){
      document.querySelector('#'+id).className+= " in";
    }
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
