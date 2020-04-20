import { Component, OnInit, Input } from '@angular/core';
import { Alert, AlertType } from '../../_models';
import { AlertService } from '../../_services';
import { Subject } from 'rxjs';
declare var $:any;

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
    @Input() id: string;

    alerts: Alert[] = [];

    constructor(
        private alertService: AlertService,
        ) { }

    showNotificationStatus = false;
    showNotificationMessage:string = '';
    notification_color:any = 'blue';
    showAlertBottomNotificationStatus = false;
    showAlertBottomNotificationMessage:string = '';
    showLoader:boolean = false;
    private unsubscribe$ = new Subject();


    ngOnInit() {
        this.alertService.getAlert(this.id).takeUntil(this.unsubscribe$).subscribe((alert: Alert) => {
            if (!alert.message) {
                // clear alerts when an empty alert is received
                this.alerts = [];
                return;
            }
            // add alert to array
            this.alerts.push(alert);
        });

        this.alertService.getNotification().takeUntil(this.unsubscribe$).subscribe(({message:message,alertType:alertType})=>{
            this.showNotificationMessage='';
            if(message){
                this.notification_color = 'blue';
                if(alertType=='error'){
                    this.notification_color = 'red';
                }
                this.showNotificationMessage= message;
                this.showNotificationStatus = true;
                setTimeout(()=>{this.showNotificationStatus = false; }, 5000)
            }
        });

        this.alertService.getAlertBottomNotification().takeUntil(this.unsubscribe$).subscribe((message:string)=>{
            this.showAlertBottomNotificationMessage='';
            if(message){
                this.showAlertBottomNotificationMessage= message;
                this.showAlertBottomNotificationStatus = true;
                setTimeout(()=>{this.showAlertBottomNotificationStatus = false; }, 5000)
            }
        });

        this.alertService.getLoaderDetails().takeUntil(this.unsubscribe$).subscribe((message:boolean)=>{
            this.showLoader = message;
        });
    }

    removeAlert(alert: Alert) {
        this.alerts = this.alerts.filter(x => x !== alert);
    }

    cssClass(alert: Alert) {
        if (!alert) {
            return;
        }
        // return css class based on alert type
        switch (alert.type) {
            case AlertType.Success:
                return 'alert alert-success';
            case AlertType.Error:
                return 'alert alert-danger';
            case AlertType.Info:
                return 'alert alert-info';
            case AlertType.Warning:
                return 'alert alert-warning';
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
    * Close alert Bottom notification
    */
    closeAlertbottomNotifcation(){
        this.showAlertBottomNotificationStatus = false;
    }
}