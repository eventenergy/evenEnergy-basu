import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolStudentProfileEditComponent } from './school-student-profile-edit.component';

describe('SchoolStudentProfileEditComponent', () => {
  let component: SchoolStudentProfileEditComponent;
  let fixture: ComponentFixture<SchoolStudentProfileEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolStudentProfileEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolStudentProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
