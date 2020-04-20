import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild, AfterContentInit } from '@angular/core';
import { RestAPIService } from '../_services';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterContentInit {
  constructor(private restApiService: RestAPIService) {}
  
  categories: string[] = new Array();
  loading: boolean = false;

  @ViewChild('searchInput') searchInput: ElementRef;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  

  ngOnInit() {
   
  }

  ngAfterContentInit(): void {
    const keyup$ = fromEvent(this.searchInput.nativeElement, 'keyup');
    keyup$.pipe(
      map((i: any)=>{
        return i.target.value;
      }),
      debounceTime(500)
    ).subscribe(console.log);
  }
}
