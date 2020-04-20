import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RestAPIService } from 'src/app/_services';

@Component({
  selector: 'app-filter-stories',
  templateUrl: './filter-stories.component.html',
  styleUrls: ['./filter-stories.component.scss']
})
export class FilterStoriesComponent implements OnInit {
  filterVisible: boolean = false;
  currentFilter: string = '';
  filterOptions: any = [];
  locationFilterValue: string = '';
  categoryFilterValue: string = '';
  appliedFilter: { [key: string]: string } = {};

  @Output() filter: EventEmitter<{ [key: string]: string }> = new EventEmitter();

  constructor(private restApiSerivce: RestAPIService) { }

  ngOnInit() { }

  async showFilter(type: string) {
    //handle case where the filter is already shown
    if (this.filterVisible && this.currentFilter == type) { this.filterVisible = false; return; }

    this.filterVisible = true;
    this.currentFilter = type;
    this.filterOptions = [];

    switch (type) {
      case 'location':
        this.filterOptions = this.fetchLocationOptions();
        break;
      case 'category':
        this.filterOptions = await this.fetchCategoryOption();
        break;
      default:
        break;
    }
  }

  fetchLocationOptions() {
    return ['Bengaluru', 'Chennai', 'Mysore']
  }

  fetchCategoryOption() {
    return new Promise<string[]>((resolve) => {
      this.restApiSerivce.getData('story/category', (response) => {
        if (Array.isArray(response)) {
          var category = [];
          response.forEach((item) => {
            if (category.indexOf(item.name) == -1) category.push(item.name);
          })
          resolve(category);
        }
      })
    })
  }

  selectFilterItem(typeIdentifier: string, value: string) {

    switch (typeIdentifier) {
      case 'location':
        this.locationFilterValue = value;
        this.filterVisible = false;
        break;
      case 'category':
        this.categoryFilterValue = value;
        this.filterVisible = false;
        break;
      default:
        break;
    }
    this.appliedFilter[typeIdentifier] = value;
    this.filter.emit(this.appliedFilter);
  }

  resetFilters() {
    this.currentFilter = '';
    this.locationFilterValue = '';
    this.categoryFilterValue = '';
    this.filterVisible = false;
    this.filter.emit(null);
  }

  printFilter() {
    // console.log(this.appliedFilter);
  }
}
