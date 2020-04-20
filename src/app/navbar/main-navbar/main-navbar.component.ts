import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, RestAPIService, AuthenticationService, NavbarService, AlertService } from '../../_services';
import { AWS_DEFAULT_LINK } from '../../config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { HelperService } from 'src/app/_helpers';
import { FormControl, FormGroup } from '@angular/forms';
declare let $: any;

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.scss']
})

export class MainNavbarComponent implements OnInit {
  private unsubscribe$ = new Subject();
  school_id: number;
  school_children_array = new Array();
  sidebar_dropdown_show: boolean = false;

  selectedSchool= null;
  selectedSchoolChild: number = 0;

  user_id: number;
  userEmail: string;
  userMobile: string;
  @ViewChild('registerModal') registerModal: ElementRef;

  school_child_registration_message: string;
  teacher_admin_registration_message: string;

  teacher_select: boolean = false;
  admin_select: boolean = false;
  newOrganization: boolean = false;
  // user_total_child_array = new Array();
  all_school_array = new Array();

  schoolListLoading:boolean;

  /* Nav bar required elements */
  links: Array<{ text: string, path: string, click: string, real_id: any }>;
  sidebar_links: Array<{ text: string, path: string, real_id: any }>;
  register_request: boolean;

  // school_nav_dropdown:boolean= true;

  loggedUserName: string;
  loggedUserStaticDpImg: string = '';
  role_selected: string;

  story_school_array = new Array();

  story_type_admin_parent_status = false;
  story_type_array = new Array();
  story_date_status = false;
  story_expiry_date_status = false;

  story_school_error_status = false;
  story_type_error_status = false;
  story_created_date_error_status = false;
  story_expiry_date_error_status = false;
  story_created_by_role: string;
  EmailName:string;
  /* user story Created date */
  user_story_created_date: Date = new Date();

  /* user story expiry date */
  user_story_expiry_date: Date = new Date();

  public datepickerConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  register_request_type: string;
  email_error:boolean= false;
  mobilenumber_error:boolean= false;

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private navbarService: NavbarService,
    private authenticateService: AuthenticationService,
    private restApiService: RestAPIService,
    private dataService: DataService,
    private alertService: AlertService,
    private helperService: HelperService
  ) {
    this.datepickerConfig = Object.assign({},
      {
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'DD/MM/YYYY',
      });

    // const state: RouterState = router.routerState;
    // console.log(state);
    // const snapshot: RouterStateSnapshot = state.snapshot;
    // console.log(snapshot);
    // const root: ActivatedRouteSnapshot = snapshot.root;
    // console.log(root);
    // const child = root.firstChild.url
    // if(child && Array.isArray(child)){
    //   child.forEach(element => {
    //     console.log(element)
    //     if(element.path=='user'){
    //       //this.school_nav_dropdown= false;
    //     }
    //   });
    // }
    // const tree: UrlTree =router.parseUrl(this.router.url);
    // // const q = tree.queryParams; // returns {debug: 'true'}
    // // console.log(q);
    // const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    // console.log(g);
    // const s: UrlSegment[] = g.segments; // returns 2 segments 'team' and '33'
    // console.log(s);


  }

  /*
  * User create story popup to restrict
  */
  checkCreateStoryDetails() {
          this.createStoryPopup();

    // this.restApiService.getData('user/login', (response) => {
    //   if (response && response['user'] && response['user']['id']) {
    //     if (response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
    //       this.register_request_type = '';
    //       this.createStoryPopup();
    //     } else {
    //       this.restApiService.getData('user/childlist/' + this.user_id, (child_response) => {
    //         if (child_response && Array.isArray(child_response) && child_response.length > 0) {
    //           this.register_request_type = 'child';
    //           this.registerRequest();
    //         } else {
    //           this.userCreateStoryModalToRestrict();
    //         }
    //       });
    //     }
    //   }
    // });
  }

  /*
  * User create story popup to restrict
  */
  userCreateStoryModalToRestrict() {
    $('#user_create_story_popup_to_restrict').modal('show');
  }

  /*
  * Route to add child component
  */
  // routeToAddChild(){
  //   $('#user_create_story_popup_to_restrict').modal('hide');
  //   this.router.navigateByUrl('/user/child/add');
  // }

  /*
  * Default Angular life cycle method
  */
  ngOnInit() {
    var obj = this;
    var response;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((result) => {
      response = result;
      if (response) {
        if (response['user'] && response['user']['id']) {
          this.dataService.getRole.takeUntil(this.unsubscribe$).subscribe((role_name) => {
            this.role_selected = role_name;
          });
          this.dataService.getSchoolId.takeUntil(this.unsubscribe$).subscribe((school_id) => {
            this.school_id = school_id;
          })

          /* Main nav Bar */
          this.navbarService.clearAllItems();
          this.navbarService.addItem({ text: 'Register', path: null, click: 'registerRequest', real_id: 'register_request' })
          this.links = this.navbarService.getLinks();


          /* Main side dropdown Bar */
          this.navbarService.clearAllSideBarItems();
          // this.navbarService.addSideBarItem({text:'Profile Setting',path:'/user/profile/edit',real_id:'profile'});
          this.navbarService.addSideBarItem({ text: 'My Tickets', path: '/user/profile/current-ticket/current', real_id: 'user_profile' });
          // console.log(this.role_selected+" role "+ this.dataService.hasRole());

          // if(this.dataService.hasRole()==='ADMIN'){
          //   this.navbarService.addSideBarItem({text:'Bank Account',path:'/user/profile/account',real_id:'bank_profile'});
          // }

          this.navbarService.addSideBarItem({ text: 'Change Password', path: '/user/change-password', real_id: 'change_password' });
          if(this.dataService.hasRole()==='ADMIN' || this.dataService.hasRole()==='TEACHER') {
            this.navbarService.addSideBarItem({ text: 'Add Bank Details', path: '/user/profile/account', real_id: 'bank_account' });
            this.navbarService.addItem({ text: 'Create Event', path: null, click: 'checkCreateStoryDetails', real_id: 'create_story' });
          }
          this.sidebar_links = this.navbarService.getSideBarLinks();

          // this.story_type_array.push({type:'STORY', display:'STORY', isChecked:false});
          this.story_type_array.push({ type: 'COMMUNITY_POST', display: 'BLOG POST', isChecked: false });
          // this.story_type_array.push({type: 'LEARNING_NOTE', display:'CHILD NOTE', isChecked:false});
          this.story_type_array.push({ type: 'ADVERTISEMENT', display: 'SCHEDULE AN EVENT', isChecked: false });




          obj.user_id = response['user']['id'];
          obj.userEmail = response['user']['email'];
          var EmailName = obj.userEmail.substring(0, obj.userEmail.lastIndexOf("@"));
          obj.userMobile = response['user']['mobile'];
          // obj.getChildList();
          // obj.getAllSchoolList();
          // obj.getSchoolChildren();
          if (response.user.userProfile.firstName) {
            this.loggedUserName = response.user.userProfile.firstName + " " + response.user.userProfile.lastName;
            if (response.user.userProfile['defaultSnapId']) {
              this.restApiService.getData('snap/' + response.user.userProfile['defaultSnapId'], (snap_details_response) => {
                if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                  obj.loggedUserStaticDpImg = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                }
              });
            }
          } else this.loggedUserName = EmailName;



        } else {
          return obj.router.navigate(['/login']);
        }
      } else {
        if (localStorage.getItem('MyApp_Auth') && localStorage.getItem('expire_time')) {
          obj.authenticateService.checkExpiryStatus();
        }
        return obj.router.navigate(['/login']);
      }
    });
  }

  /*
  * Default logout function
  */
  logOut() {
    this.authenticateService.logoutOauth2();
    // this.authenticateService.logoutOauth2();
  }

  /*
  * Parent Register popup display function
  */
  registerRequest() {
    $('#user_create_story_popup_to_restrict').modal('hide');
    this.selectedSchool = null;
    this.selectedSchoolChild = 0;
    this.teacher_select = false;
    this.admin_select = false;
    // this.user_total_child_array.forEach(element => {
    //   element.isChecked = false;
    // });
    this.school_child_registration_message = '';
    this.teacher_admin_registration_message = '';
    this.getAllSchoolList();
    $(this.registerModal.nativeElement).modal('show');
    if (this.register_request_type == 'child') {
      $('#registerModal a[href="#childReqTab"]').tab('show');
    } else {
      $('#registerModal a[href="#teacherAdminReqTab"]').tab('show');
    }
  }

  /**************REQUESTING TO BECOME A TEACHER START**********************/

  /*
  * Selected school based on type
  */
  onChangeSelectSchool(school_id: number, type) {
    if (school_id > 0) {
      if (type == 'child') {
        this.selectedSchoolChild = school_id;
      } else if (type == 'teacher_admin') {
        this.selectedSchool = school_id;
      }
    } else {
      this.selectedSchoolChild = 0;
      this.selectedSchool = null;
    }
  }

  /*
  * Send Request to become teacher or admin function
  */
  requestAsTeacherOrAdmin() {
    if (this.selectedSchool != null && this.user_id && (this.teacher_select || this.admin_select)) {
      var message = {
        "registrationMessage": (this.teacher_admin_registration_message ? this.teacher_admin_registration_message.toString().trim() : '')
      };
      if (this.teacher_select) {
        this.restApiService.postAPI('user/request/school/' + this.selectedSchool + '/teacher/' + this.user_id, message, (response) => {
          if (response && response['message'] && response['success'] == false) {
            if (response['message']) {
              this.alertService.showNotification(response['message'], 'error')
            }
          } else if (response && response['id']) {
            this.alertService.showAlertBottomNotification('Request Sent');
            setTimeout(() => { $(this.registerModal.nativeElement).modal('hide'); }, 1000);
          } else {
            this.alertService.showNotification('Something went wrong', 'error');
          }
        });
      }
      if (this.admin_select) {
        this.restApiService.postAPI('user/request/school/' + this.selectedSchool + '/admin/' + this.user_id, message, (response) => {
          if (response && response['message'] && response['success'] == false) {
            if (response['message']) {
              this.alertService.showNotification(response['message'], 'error');
            }
          } else if (response && response['id']) {
            this.alertService.showAlertBottomNotification('Request Sent');
            setTimeout(() => { $(this.registerModal.nativeElement).modal('hide'); }, 1000);
          } else {
            this.alertService.showNotification('Something went wrong', 'error');
          }
        });
      }
    } else {
      if (this.selectedSchool == null) {
        this.alertService.showNotification('Organization field is required', 'error');
        return false;
      }
      if (!this.teacher_select) {
        this.alertService.showNotification('Member or Organization field is required', 'error');
        return false;
      }
    }
  }

  /*
  * Select Teacher or Admin checkbox
  */
  selectTeacherAdmin(e, name) {
    if (e.target.checked) {
      if (name == 'admin') {
        this.admin_select = true;
      } else if (name == "teacher") {
        this.teacher_select = true;
      }
    } else {
      if (name == 'admin') {
        this.admin_select = false;
      } else if (name == "teacher") {
        this.teacher_select = false;
      }
    }
  }

  /**************REQUESTING TO BECOME A TEACHER END**********************/


  /**************REQUESTING TO ADD A CHILD TO SCHOOL START****************** */
  // selected_either_one_child_status: boolean = false;
  /*
  * Select Children to register to school
  */
  // selectChild(id) {
  //   var check_id = this.user_total_child_array.filter((details) => { return details.id === parseInt(id) && details.isChecked === true });
  //   if (check_id.length == 0) {
  //     var index_value = this.user_total_child_array.findIndex(obj => obj.id == parseInt(id));
  //     if (index_value > -1) {
  //       if (typeof this.user_total_child_array[index_value] !== 'undefined') {
  //         this.user_total_child_array[index_value]['isChecked'] = true;
  //       }
  //     }
  //   } else {
  //     var index_value = this.user_total_child_array.findIndex(obj => obj.id == parseInt(id));
  //     if (index_value > -1) {
  //       if (typeof this.user_total_child_array[index_value] !== 'undefined') {
  //         this.user_total_child_array[index_value]['isChecked'] = false;
  //       }
  //     }
  //   }
  //   this.selected_either_one_child_status = false;
  //   this.user_total_child_array.forEach(element => {
  //     if (element.isChecked) {
  //       this.selected_either_one_child_status = true;
  //     }
  //   });
  // }

  /*
  * Request Admin to register child to school
  */
  // requestChildToSchool() {
  //   if (this.selectedSchoolChild != 0 && this.user_id) {
  //     var status: boolean = false;
  //     this.user_total_child_array.forEach(element => {
  //       if (element.isChecked) {
  //         status = true;
  //       }
  //     });

  //     if (status) {
  //       this.user_total_child_array.forEach(element => {
  //         if (element.isChecked) {
  //           var message = { "registrationMessage": (this.school_child_registration_message ? this.school_child_registration_message.toString().trim() : '') }
  //           this.restApiService.postAPI('parent/request/school/' + this.selectedSchoolChild + '/student/' + element.id, message, (response) => {
  //             if (response && response['message'] && response['success'] == false) {
  //               if (response['message']) {
  //                 this.alertService.showNotification('Child Already Registered', 'error');
  //               }
  //             } else if (response && response['id']) {
  //               this.alertService.showAlertBottomNotification('Request Sent');
  //               if (this.selectedSchoolChild) {
  //                 this.authenticateService.checkUserAdminStatus(this.selectedSchoolChild, element.id);
  //                 setTimeout(() => { $(this.registerModal.nativeElement).modal('hide'); }, 1000);
  //               }
  //             } else {
  //               this.alertService.showNotification('Something went wrong', 'error');
  //               return false;
  //             }
  //           });
  //         }
  //       });
  //     } else {
  //       this.alertService.showNotification('School or child field is required', 'error');
  //       return false;
  //     }
  //   } else {
  //     this.alertService.showNotification('School or child field is required', 'error')
  //     return false;
  //   }
  // }

  /*
  * Get Children list based on user
  */
  // getChildList() {
  //   if (this.user_id) {
  //     this.user_total_child_array = [];
  //     this.restApiService.getData('user/childlist/' + this.user_id, (child_response) => {
  //       console.log(child_response);
  //       console.log('child list');
  //       if (child_response && Array.isArray(child_response) && child_response.length > 0) {
  //         child_response.forEach(element => {
  //           var check_id = this.user_total_child_array.filter((details) => { return details.id === element.id });
  //           if (check_id.length == 0) {
  //             var child = [];
  //             child['isChecked'] = false;
  //             // if(element.firstName) child['firstName']=element.firstName;
  //             // else child['firstName']='Anonymous';
  //             child['firstName'] = element.firstName;
  //             child['lastName'] = element.lastName;
  //             child['id'] = element.id;
  //             if (element['defaultSnapId']) {
  //               this.restApiService.getData('snap/' + element['defaultSnapId'], (snap_details_response) => {
  //                 if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
  //                   child['staticDpImg'] = AWS_DEFAULT_LINK + snap_details_response.imgPath;
  //                 }
  //               });
  //             } else {
  //               child['staticDpImg'] = '';
  //             }
  //             this.user_total_child_array.push(child);
  //           }
  //         });
  //         if (this.user_total_child_array.length > 0) {
  //           this.register_request_type = 'child';
  //         }
  //       }
  //     });
  //   }
  // }

  /*
  * Get All School data
  */
  getAllSchoolList() {
    this.all_school_array = [];
    this.schoolListLoading = true;
    this.restApiService.getData('school/query?isApproved=true&&isPublic=true', (response) => {
      if (response && Array.isArray(response.content) && response.content.length > 0) {
        response.content.forEach(element => {
          var check_id = this.all_school_array.filter((details) => { return details.id === element.id });
          if (check_id.length == 0) {
            this.all_school_array.push(element);
          }
        });
      }
      this.schoolListLoading = false;
    });
  }

  /*
  * create story function to parent, teacher and admin
  */
  createStoryPopup() {
    localStorage.removeItem('story_creation_type_details');
    this.story_school_array.length = 0;
    this.story_type_admin_parent_status = false;
    this.story_date_status = false;
    this.story_expiry_date_status = false;

    this.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response) => {
      if (response && response['user'] && response['user']['id'] && response['schoolDetail'] && Array.isArray(response['schoolDetail']) && response['schoolDetail'].length > 0) {
        response['schoolDetail'].forEach(element => {
          if (element.school.id && element.school.name && element.role) {
            var check_id = this.story_school_array.filter((details) => { return details.id === element.school.id });
            if (check_id.length == 0) {
              let staticSchoolDpImg = '';
              if (element['defaultSnapId']) {
                this.restApiService.getData('snap/' + element['defaultSnapId'], (snap_details_response) => {
                  if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
                    staticSchoolDpImg = AWS_DEFAULT_LINK + snap_details_response.imgPath;
                  }
                });
              }
              this.story_school_array.push({ id: element.school.id, name: element.school.name, role: element.role, staticSchoolDpImg: staticSchoolDpImg, isChecked: false })
            }
          }
        });
      }
    });
    if (this.story_school_array.length > 1) $('#create_story_popup').modal('show');
    else {
      this.storySelectSchool(this.story_school_array[0].id);
      this.saveStoryPopupDetails();
    }
  }

  /*
  * Function to select the school
  * while creating the story
  */
  storySelectSchool(school_id) {
    this.story_school_error_status = false;
    this.story_type_admin_parent_status = false;
    this.story_date_status = false;
    this.story_expiry_date_status = false;
    this.story_school_array.forEach(element => {
      if (element.id !== school_id) {
        element.isChecked = false;
      }
    });
    var check_id = this.story_school_array.filter((details) => { return details.id === parseInt(school_id) && details.isChecked === true });
    if (check_id.length == 0) {
      var index_value = this.story_school_array.findIndex(obj => obj.id == parseInt(school_id));
      if (index_value > -1) {
        if (typeof this.story_school_array[index_value] !== 'undefined') {
          this.story_school_array[index_value]['isChecked'] = true;
        }
      }
    } else {
      var index_value = this.story_school_array.findIndex(obj => obj.id == parseInt(school_id));
      if (index_value > -1) {
        if (typeof this.story_school_array[index_value] !== 'undefined') {
          this.story_school_array[index_value]['isChecked'] = false;
        }
      }
    }
    this.story_type_array.forEach(element => {
      element.isChecked = false;
    });

    var check_id_selected = this.story_school_array.filter((details) => { return details.id === parseInt(school_id) && details.isChecked === true });
    if (check_id_selected && Array.isArray(check_id_selected) && check_id_selected.length > 0) {
      check_id_selected.forEach(element => {
        if (element.role && Array.isArray(element.role) && element.role.length > 0) {
          var index_value = element.role.findIndex(obj => obj == 'ADMIN' || obj == 'TEACHER');
          if (index_value > -1) {
            this.story_type_admin_parent_status = true;
          }
          if (!this.story_type_admin_parent_status) {
            var parent_check_index_value = element.role.findIndex(obj => obj == 'PARENT');
            if (parent_check_index_value > -1) {
              this.story_created_by_role = 'PARENT';
              this.story_date_status = true;
              this.story_type_array.forEach(element => {
                if (element.type == 'STORY') {
                  element.isChecked = true;
                }
              })
            }
          }
          var admin_check_index_value = element.role.findIndex(obj => obj == 'ADMIN');
          if (admin_check_index_value > -1) {
            this.story_created_by_role = 'ADMIN';
          }
          if (this.story_created_by_role != 'ADMIN' && this.story_created_by_role != 'PARENT') {
            var teacher_check_index_value = element.role.findIndex(obj => obj == 'TEACHER');
            if (teacher_check_index_value > -1) {
              this.story_created_by_role = 'TEACHER';
            }
          }
        }
      });
    }
  }

  /*
  * Function to select the story type
  * while creating the story
  */
  storySelectStoryType(type) {
    this.story_date_status = false;
    this.story_expiry_date_status = false;
    this.story_type_array.forEach(element => {
      if (element.type !== type) {
        element.isChecked = false;
      }
    });
    var check_id = this.story_type_array.filter((details) => { return details.type === type && details.isChecked === true });
    if (check_id.length == 0) {
      var index_value = this.story_type_array.findIndex(obj => obj.type == type);
      if (index_value > -1) {
        if (typeof this.story_type_array[index_value] !== 'undefined') {
          this.story_type_array[index_value]['isChecked'] = true;
        }
      }
    } else {
      var index_value = this.story_type_array.findIndex(obj => obj.type == type);
      if (index_value > -1) {
        if (typeof this.story_type_array[index_value] !== 'undefined') {
          this.story_type_array[index_value]['isChecked'] = false;
        }
      }
    }

    var check_id_selected = this.story_type_array.filter((details) => { return details.type === type && details.isChecked === true });
    if (check_id_selected && Array.isArray(check_id_selected) && check_id_selected.length > 0) {
      this.story_date_status = true;
      this.user_story_created_date = new Date();
    }

    if (type == 'ADVERTISEMENT') {
      this.story_expiry_date_status = true;
      this.user_story_expiry_date = new Date();
    }
  }

  /*
  * Function to save all story details
  */
  saveStoryPopupDetails() {
    this.storySelectStoryType("COMMUNITY_POST");
    this.story_school_error_status = false;
    this.story_type_error_status = false;
    this.story_created_date_error_status = false;
    this.story_expiry_date_error_status = false;
    var school_id = 0, story_type = '';

    if (this.story_school_array && Array.isArray(this.story_school_array) && this.story_school_array.length > 0) {
      this.story_school_array.forEach(element => {
        if (element.isChecked) {
          school_id = element.id;
        }
      });
    }
    if (!school_id) {
      this.story_school_error_status = true;
      return false;
    }
    if (this.story_type_array && Array.isArray(this.story_type_array) && this.story_type_array.length > 0) {
      this.story_type_array.forEach(element => {
        if (element.isChecked) {
          story_type = element.type;
        }
      });
    }
    if (!story_type) {
      this.story_type_error_status = true;
      return false;
    }
    if (!this.user_story_created_date) {
      this.story_created_date_error_status = true;
      return false;
    }
    if (story_type && story_type == 'ADVERTISEMENT' && !this.user_story_expiry_date) {
      this.story_expiry_date_error_status = true;
      return false;
    }
    if (school_id && story_type && this.user_story_created_date && this.story_created_by_role) {
      if (story_type == 'ADVERTISEMENT' && !this.user_story_expiry_date) {
        this.alertService.showNotification('Something went wrong, please try again', 'error');
        return false;
      }
      if (story_type == 'STORY' || story_type == 'LEARNING_NOTE') {
        // this.restApiService.getData('user/getStudentsBySchool/' + school_id, (school_children_response) => {
        //   if (school_children_response && Array.isArray(school_children_response) && school_children_response.length > 0) {
        //     var story_creation_type_details = { 'school_id': school_id, 'story_type': story_type, 'story_created_date': this.user_story_created_date, 'story_created_by_role': this.story_created_by_role, 'story_expiry_date': this.user_story_expiry_date };
        //     localStorage.setItem('story_creation_type_details', JSON.stringify(story_creation_type_details));
        //     $('#create_story_popup').modal('hide');
        //     return this.router.navigateByUrl('/story/create/new');
        //   } else {
        //     this.alertService.showNotification('You should be a member of an organization to create an event', 'error');
        //     return false;
        //   }
        // });
      } else {
        var story_creation_type_details = { 'school_id': school_id, 'story_type': story_type, 'story_created_date': this.user_story_created_date, 'story_created_by_role': this.story_created_by_role, 'story_expiry_date': this.user_story_expiry_date };
        localStorage.setItem('story_creation_type_details', JSON.stringify(story_creation_type_details));
        // console.log(story_creation_type_details);
        $('#create_story_popup').modal('hide');
        return this.router.navigateByUrl('/story/create/new');
      }
    } else {
      this.alertService.showNotification('Something went wrong, please try again', 'error');
      return false;
    }
  }

  /* 
  * Get School Children details 
  */
  // getSchoolChildren() {
  //   if (this.school_id) {
  //     this.restApiService.getData('user/getStudentsBySchool/' + this.school_id, (response) => {
  //       console.log(response);
  //       console.log('hihi');
  //       if (response && Array.isArray(response) && response.length > 0) {
  //         response.forEach(element => {
  //           if (element.status && element.child) {
  //             var check_id = this.school_children_array.filter((details) => { return details.id === element.child.id });
  //             if (check_id.length == 0) {
  //               let staticDpImg = '';
  //               if (element.child['defaultSnapId']) {
  //                 this.restApiService.getData('snap/' + element.child['defaultSnapId'], (snap_details_response) => {
  //                   if (snap_details_response && snap_details_response.id && snap_details_response.imgPath) {
  //                     staticDpImg = AWS_DEFAULT_LINK + snap_details_response.imgPath;
  //                   }
  //                 });
  //               }
  //               var student = {
  //                 id: element.child.id, firstName: element.child.firstName, lastName: element.child.lastName, tagged_status: false,
  //                 staticDpImg: staticDpImg, type: 'school_children'
  //               };
  //               this.school_children_array.push(student);
  //             }
  //           }
  //         });
  //         if (this.school_children_array && this.school_children_array.length > 0) {
  //           this.register_request_type = '';
  //           // this.navbarService.addItem({text:'Create Story',path:null, click:'createStoryPopup', real_id:'create_story'});
  //         }
  //       }
  //     });
  //   }
  // }



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
  updateDefaultImageUrl(event) {
    this.helperService.updateDefaultImageUrlHelper(event);
  }

  createNewOrganization(orgName: string,orgEmail: string,orgMobileNumber: string) {
    //to create new organization
    // 1) PUT school/update
    // 2) POST user/request/school/ <SchoolId> /admin/<UserId>
    // 3) PUT user/ <SchoolId> /admin/school/ <SchoolId> /approve
    $('#registerModal').modal('hide');
    this.alertService.showLoader();
    var newOrgData = {
      name: orgName,
      emailAddress: orgEmail,
      MobNo: orgMobileNumber,
    }
    // 1) PUT school/update
    this.restApiService.putAPI('school/update', newOrgData, (resp1) => {
      if (resp1 && resp1.id) {
        // 2) POST user/request/school/ <SchoolId> /admin/ <UserId>
        this.restApiService.postAPI(`user/request/school/${resp1.id}/admin/${this.user_id}`,
          { message: 'Register request to school' },
          (resp2) => {
            if (resp2 && resp2.success && resp2.user.id == this.user_id) {
              // 3) PUT user/ <SchoolId> /admin/school/ <SchoolId> /approve
              this.restApiService.putAPI(`user/${this.user_id}/admin/school/${resp1.id}/approve`,
                {},
                (resp3) => {
                  if (resp3 && resp3.user.id == this.user_id) {
                    //handle success here
                    var currentUserObject = this.restApiService.getOfflineLoggedUserDetails();
                    if (currentUserObject && Array.isArray(currentUserObject.schoolDetail)) {
                      currentUserObject.schoolDetail.push({
                        role: ["ADMIN"],
                        school: {
                          about: null,
                          address: null,
                          createdAt: resp1.createdAt,
                          defaultSnapId: null,
                          dpImg: null,
                          dpImgSnapIds: null,
                          emailAddress: null,
                          id: resp1.id,
                          mobNo: "",
                          name: orgName,
                          snaps: null,
                          updatedAt: resp1.updateAt,
                          website: null
                        }
                      })
                      localStorage.setItem('loggedUser', JSON.stringify(currentUserObject));
                      this.authenticateService.userObjectSubject.next(currentUserObject);
                      this.alertService.hideLoader();
                      this.dataService.changeSchoolId(resp1.id);
                      this.router.navigate(['/admin/organization/admin']);
                    }
                  }
                  else {
                    this.alertService.hideLoader();
                    this.alertService.showNotification('There was a problem creating an orgnization. Please try again.');
                  }
                }
              )
            } else {
              this.alertService.hideLoader();
              this.alertService.showNotification('There was a problem creating an orgnization. Please try again.');
            }

          },(error)=>{
            this.alertService.hideLoader();
            this.alertService.showNotification('There was a problem creating an orgnization. Please try again.');
          }
        )
      } else {
        this.alertService.hideLoader();
        this.alertService.showNotification('Could Not Create Organization');
      }
    })
  }
}