import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolStudentsComponent } from './school-students.component';

describe('SchoolStudentsComponent', () => {
  let component: SchoolStudentsComponent;
  let fixture: ComponentFixture<SchoolStudentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolStudentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
