import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminEventApprovalsComponent } from './super-admin-event-approvals.component';

describe('SuperAdminApprovalsComponent', () => {
  let component: SuperAdminEventApprovalsComponent;
  let fixture: ComponentFixture<SuperAdminEventApprovalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminEventApprovalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminEventApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
