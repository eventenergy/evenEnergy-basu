import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherUndertakingClassComponent } from './teacher-undertaking-class.component';

describe('TeacherUndertakingClassComponent', () => {
  let component: TeacherUndertakingClassComponent;
  let fixture: ComponentFixture<TeacherUndertakingClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherUndertakingClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherUndertakingClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
