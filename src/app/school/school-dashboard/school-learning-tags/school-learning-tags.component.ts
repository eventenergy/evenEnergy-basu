import { Component, OnInit } from '@angular/core';
import { HelperService } from '../../../_helpers';

@Component({
  selector: 'app-school-learning-tags',
  templateUrl: './school-learning-tags.component.html',
  styleUrls: ['./school-learning-tags.component.scss']
})
export class SchoolLearningTagsComponent implements OnInit {

  constructor(
    private helperService: HelperService
  ) { }

  ngOnInit() {
  }

  /* 
  * Angular default life cycle method 
  */
  ngAfterViewInit(): void {
    this.helperService.closeMenuIcon();
  }

}
