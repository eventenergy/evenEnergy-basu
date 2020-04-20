import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  storeData(identifier: string, data: any){
    localStorage.setItem(identifier, JSON.stringify(data));
  }

  getStoredData(identifier: string){
    try {
      return JSON.parse(localStorage.getItem(identifier));  
    } catch (error) {
      return null;
    }
  }

  deleteStoredData(key: string){
    localStorage.removeItem(key);
  }

  addVisitedEvent(eventId: number){
    var visitedArray = this.getStoredData('visitedEvents');
    if(visitedArray && Array.isArray(visitedArray)){
      if(visitedArray.indexOf(eventId) == -1) visitedArray.push(eventId);
    }else{
      visitedArray = [eventId];
    }
    this.storeData('visitedEvents', visitedArray);
  }
}
