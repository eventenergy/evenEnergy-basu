import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/filter';
import { AlertType, Alert } from '../_models';
import { Title } from '@angular/platform-browser';
declare let $: any;

@Injectable()
export class AlertService {
  private subject = new Subject<Alert>();
  private boolSubject = new Subject<boolean>();
  private keepAfterRouteChange = false;

  private notification = new Subject();
  private bottomNotification = new Subject();
  private loader = new Subject();
  public blurEveryting: boolean = false;

  public returnBlur(){
    return this.blurEveryting;
  }
  constructor(private router: Router,private titleService: Title) {
      // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
          if (this.keepAfterRouteChange) {
              // only keep for a single route change
              this.keepAfterRouteChange = false;
          } else {
              // clear alert messages
              this.clear();
          }
      }
    });
  }

  //To set browser title
  setTitle($element){
    this.titleService.setTitle( 'EventEnergies | '+$element );
  }

  showNotification(message: string, alertType?: string){
    this.notification.next({message:message, alertType: alertType});
  }

  conform(message: string): Observable<boolean> | boolean{
    
    return false;
  }

  getNotification(){
    return this.notification.asObservable();
  }

  showAlertBottomNotification(message:string){
    this.bottomNotification.next(message);
  }

  getAlertBottomNotification(){
    return this.bottomNotification.asObservable();
  }


  // subscribe to alerts
  getAlert(alertId?: string): Observable<any> {
      return this.subject.asObservable().filter((x: Alert) => x && x.alertId === alertId);
  }

  // convenience methods
  success(message: string) {
    this.alert(new Alert({ message, type: AlertType.Success }));
  }

  error(message: string) {
      this.alert(new Alert({ message, type: AlertType.Error }));
  }

  info(message: string) {
      this.alert(new Alert({ message, type: AlertType.Info }));
  }

  warn(message: string) {
      this.alert(new Alert({ message, type: AlertType.Warning }));
  }

  // main alert method    
  alert(alert: Alert) {
      this.keepAfterRouteChange = alert.keepAfterRouteChange;
      this.subject.next(alert);
  }

  // clear alerts
  clear(alertId?: string) {
      this.subject.next(new Alert({ alertId }));
  }

  showLoader(){
    this.loader.next(true);
  }

  hideLoader(){
    this.loader.next(false);
  }

  getLoaderDetails(){
    return this.loader.asObservable();
  }
}