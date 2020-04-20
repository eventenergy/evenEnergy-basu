import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Person {
  id: string;
  isActive: boolean;
  age: number;
  name: string;
  gender: string;
  company: string;
  email: string;
  phone: string;
  disabled?: boolean;
}

@Injectable()
export class DataService {

  private userId = new BehaviorSubject<number>(this.hasUserId());
  getCurrentUserId = this.userId.asObservable();

  private schoolId = new BehaviorSubject<number>(this.hasSchoolId());
  getSchoolId = this.schoolId.asObservable();

  private role = new BehaviorSubject<string>(this.hasRole());
  getRole = this.role.asObservable();

  private schoolDetails = new BehaviorSubject<{}>([]);
  
  constructor() { }

  /*
  * Function to change user id
  */
  changeUserId(id: number) {
    this.userId.next(id)
    if(id!=0){
      localStorage.setItem('logged_user_id',id.toString());
    }else{
      localStorage.removeItem('logged_user_id');
    }
  }

  /*
  * Function to change school id
  */
  changeSchoolId(id: number) {
    this.schoolId.next(id)
    if(id!=0){
      localStorage.setItem('logged_school_id',id.toString());
    }else{
      localStorage.removeItem('logged_school_id');
    }
  }

  /*
  * Function to change role name
  */
  changeRole(name: string) {
    this.role.next(name);
    if(name!=''){
      localStorage.setItem('logged_role',name);
    }else{
      localStorage.removeItem('logged_role');
    }
  }

  /*
  * Function to check selected userId
  */
  hasUserId() {
    if(localStorage.getItem('logged_user_id')){
      return parseInt(localStorage.getItem('logged_user_id'));
    }
    return 0;
  }

  /*
  * Function to check selected schoolId
  */
  hasSchoolId(){
    if(localStorage.getItem('logged_school_id')){
      return parseInt(localStorage.getItem('logged_school_id'));
    }
    return 0;
  }

  /*
  * Function to check selected role
  */
  hasRole(){
    if(localStorage.getItem('logged_role')){
      return localStorage.getItem('logged_role');
    }
    return '';
  }

  /*
  * Function to save admin 
  */
  setHighestRole(role: string) {
    if(role!=''){
      localStorage.setItem('highest_role',role);
    }else{
      localStorage.removeItem('highest_role');
    }
  }

  /*
  * Function to check Highest role
  */
  hasHighestRole(){
    if(localStorage.getItem('highest_role')){
      return localStorage.getItem('highest_role');
    }
    return '';
  }


  /*
  * Function to return School Details as Observable
  */
  getSchoolDetails(){
    return this.schoolDetails.asObservable();
  }

  /*
  * Function to save School Details
  */
  saveSchoolDetails(response){
    this.schoolDetails.next(response);
  }
}