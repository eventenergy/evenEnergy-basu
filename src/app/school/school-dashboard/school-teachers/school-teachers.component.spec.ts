import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolTeachersComponent } from './school-teachers.component';

describe('SchoolTeachersComponent', () => {
  let component: SchoolTeachersComponent;
  let fixture: ComponentFixture<SchoolTeachersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolTeachersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolTeachersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
