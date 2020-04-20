import { Injectable } from '@angular/core';

@Injectable()
export class NavbarService {

  /*
   * Navbar Links to add element 
  */
  private links = new Array<{ text: string, path: string, click: string, real_id:any }>();
  private sidebar_links = new Array<{ text: string, path: string, real_id: any }>();
  private menu_sidebar_links = new Array<{id: string, text: string, path: string, staticDpImg: string, image_text: string, font_icon:string,real_id:any, sub_menu:Array<{id: string, text: string, path: string, sub_menu_1:Array<{text: string, path: string}>}>}>();
  // public register_request=new BehaviorSubject<any>(null);
  // public parent_status=new BehaviorSubject<any>(null);

  constructor() {}
  
  /* 
  * Function to get All navbar links 
  */
  getLinks() {
    return this.links;
  }

  /* 
  * Function to Add navbar links
  */
  addItem({ text, path, click, real_id }) {
    var checked_index_value= this.links.findIndex(obj => obj.real_id == real_id);
    if(checked_index_value>-1){
      if(typeof this.links[checked_index_value] !== 'undefined'){
        this.links[checked_index_value]['text']=text;
        this.links[checked_index_value]['path']=path;
        this.links[checked_index_value]['click']=click;
        this.links[checked_index_value]['real_id']=real_id;
      }
      // this.links.splice(checked_index_value, 1);
      // this.links.push({ text: text, path: path, click: click, real_id:real_id });
    }else{
      this.links.push({ text: text, path: path, click: click, real_id:real_id });
    }
  }

  /* 
  * Function to remove navbar link
  */
  removeItem({ text }) {
    this.links.forEach((link, index) => {
      if (link.text === text) {
        this.links.splice(index, 1);
      }
    });
  }

  /* 
  * Function to clear all navbar link
  */
  clearAllItems() {
    this.links.length = 0;
  }


  /* 
  * Function to get All side navbar links 
  */
  getSideBarLinks() {
    return this.sidebar_links;
  }

  /* 
  * Function to Add navbar links
  */
  addSideBarItem({ text, path, real_id }) {
    var checked_index_value= this.sidebar_links.findIndex(obj => obj.real_id == real_id);
    if(checked_index_value>-1){
      if(typeof this.sidebar_links[checked_index_value] !== 'undefined'){
        this.sidebar_links[checked_index_value]['text']= text;
        this.sidebar_links[checked_index_value]['path']= path;
        this.sidebar_links[checked_index_value]['real_id']= real_id;
      }
      // this.sidebar_links.splice(checked_index_value, 1);
      // this.sidebar_links.push({ text: text, path: path, real_id: real_id });
    }else{
      this.sidebar_links.push({ text: text, path: path, real_id: real_id });
    }
  }

  /* 
  * Function to remove navbar link
  */
  removeSideBarItem({ text }) {
    this.sidebar_links.forEach((link, index) => {
      if (link.text === text) {
        this.sidebar_links.splice(index, 1);
      }
    });
  }

  /*
  * Function to clear all navbar link
  */
  clearAllSideBarItems() {
    this.sidebar_links.length = 0;
  }


  /* 
  * Function to get All main sidebar links 
  */
  getMenuSidebarLinks() {
    return this.menu_sidebar_links;
  }

  /* 
  * Function to Add  main sidebar links
  */
  addMenuSidebarItem({ id, text, path, staticDpImg, image_text, font_icon,real_id, sub_menu }) {
    var checked_index_value= this.menu_sidebar_links.findIndex(obj => obj.real_id == real_id);
    if(checked_index_value>-1){
      if(typeof this.menu_sidebar_links[checked_index_value] !== 'undefined'){
        this.menu_sidebar_links[checked_index_value]['id']= id;
        this.menu_sidebar_links[checked_index_value]['text']= text;
        this.menu_sidebar_links[checked_index_value]['path']= path;
        this.menu_sidebar_links[checked_index_value]['staticDpImg']= staticDpImg;
        this.menu_sidebar_links[checked_index_value]['image_text']= image_text;
        this.menu_sidebar_links[checked_index_value]['font_icon']= font_icon;
        this.menu_sidebar_links[checked_index_value]['real_id']= real_id;
        this.menu_sidebar_links[checked_index_value]['sub_menu']= sub_menu;
      }
      // this.menu_sidebar_links.splice(checked_index_value,1,{id: id,  text: text, path: path, staticDpImg: staticDpImg, image_text: image_text, font_icon: font_icon, real_id: real_id,sub_menu: sub_menu });
      // this.menu_sidebar_links.push();
    }else{
      this.menu_sidebar_links.push({id: id,  text: text, path: path, staticDpImg: staticDpImg, image_text: image_text, font_icon: font_icon, real_id: real_id, sub_menu: sub_menu });
    }
  }

  /* 
  * Function to remove main sidebar link
  */
  removeMenuSidebarItem({ real_id }) {
    this.menu_sidebar_links.forEach((link, index) => {
      if (link.real_id === real_id) {
        this.menu_sidebar_links.splice(index, 1);
      }
    });
  }

  /* 
  * Function to clear all main sidebar link
  */
  clearAllMenuSidebarItems() {
    this.menu_sidebar_links.length = 0;
  }
  

  // /* 
  // * Function to get parent login status
  // */
  // getParentStatus(){
  //   return this.parent_status;
  // }
  
  // /* 
  // * Function to get register request
  // */
  // getRegisterRequestStatus(){
  //   return this.register_request.asObservable();
  // }

}
