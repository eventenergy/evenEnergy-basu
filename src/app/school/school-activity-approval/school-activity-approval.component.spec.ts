import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolActivityApprovalComponent } from './school-activity-approval.component';

describe('SchoolActivityApprovalComponent', () => {
  let component: SchoolActivityApprovalComponent;
  let fixture: ComponentFixture<SchoolActivityApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolActivityApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolActivityApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
