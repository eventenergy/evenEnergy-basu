import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.component.html',
  styleUrls: ['./static-page.component.scss']
})
export class StaticPageComponent implements OnInit {

  staticType:string;
  displayAboutUs = "none";
  displayFaq = "none";
  displayTutorials = "none";
  displayService = "none";
  displayPrivacyPolicy = "none";
  displayContactUs = "none";
  private unsubscribe$ = new Subject();
  logged_status: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authenticateService: AuthenticationService,
  ) {
    this.activatedRoute.params.subscribe(paramsId => {
      this.staticType = paramsId.static;
      if(this.staticType == 'about-us'){
        this.displayAboutUs = "block";
        this.displayFaq = "none";
        this.displayTutorials = "none";
        this.displayService = "none";
        this.displayPrivacyPolicy = "none";
        this.displayContactUs = "none";
      }
      if(this.staticType == 'frequently-asked-questions'){
        this.displayAboutUs = "none";
        this.displayFaq = "block";
        this.displayTutorials = "none";
        this.displayService = "none";
        this.displayPrivacyPolicy = "none";
        this.displayContactUs = "none";
      }
      if(this.staticType == 'tutorials'){
        this.displayAboutUs = "none";
        this.displayFaq = "none";
        this.displayTutorials = "block";
        this.displayService = "none";
        this.displayPrivacyPolicy = "none";
        this.displayContactUs = "none";
      }
      if(this.staticType == 'service'){
        this.displayAboutUs = "none";
        this.displayFaq = "none";
        this.displayTutorials = "none";
        this.displayService = "block";
        this.displayPrivacyPolicy = "none";
        this.displayContactUs = "none";
      }
      if(this.staticType == 'privacy-policy'){
        this.displayAboutUs = "none";
        this.displayFaq = "none";
        this.displayTutorials = "none";
        this.displayService = "none";
        this.displayPrivacyPolicy = "block";
        this.displayContactUs = "none";
      }
      if(this.staticType == 'contact-us'){
        this.displayAboutUs = "none";
        this.displayFaq = "none";
        this.displayTutorials = "none";
        this.displayService = "none";
        this.displayPrivacyPolicy = "none";
        this.displayContactUs = "block";
      }
  });
   }

  ngOnInit() {
    var obj = this;
    obj.logged_status = false;
    obj.authenticateService.getUserObject().takeUntil(this.unsubscribe$).subscribe((response) => {
      if (response) {
        if (response['user'] && response['user']['id']) {
          obj.logged_status = true;
        }
      } else {
        obj.logged_status = false;
      }
    });
  }

}
