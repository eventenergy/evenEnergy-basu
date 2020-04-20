import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolEventSalesComponent } from './school-event-sales.component';

describe('SchoolEventSalesComponent', () => {
  let component: SchoolEventSalesComponent;
  let fixture: ComponentFixture<SchoolEventSalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolEventSalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolEventSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
