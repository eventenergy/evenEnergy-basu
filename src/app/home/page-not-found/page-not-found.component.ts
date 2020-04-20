import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/_services';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private location : Location,
    private alertService: AlertService
  ){}
  
  /* 
   *  Angular Default lifecycle method
  */
  ngOnInit() {
    this.alertService.setTitle( 'Page Not Found' );//alert service for set title
    this.location.replaceState('/');
  }

  /* 
   *  Function to go back loaded page
  */
  goBack(){
    this.location.back();
  }
}
