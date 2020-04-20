import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolActivityComponent } from './school-activity.component';

describe('SchoolActivityComponent', () => {
  let component: SchoolActivityComponent;
  let fixture: ComponentFixture<SchoolActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
