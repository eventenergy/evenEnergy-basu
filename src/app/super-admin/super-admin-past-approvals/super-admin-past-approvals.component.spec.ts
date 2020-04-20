import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminPastApprovalsComponent } from './super-admin-past-approvals.component';

describe('SuperAdminPastApprovalsComponent', () => {
  let component: SuperAdminPastApprovalsComponent;
  let fixture: ComponentFixture<SuperAdminPastApprovalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminPastApprovalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminPastApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
