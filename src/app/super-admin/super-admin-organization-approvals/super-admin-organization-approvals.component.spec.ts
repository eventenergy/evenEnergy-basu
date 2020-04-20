import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminOrganizationApprovalsComponent } from './super-admin-organization-approvals.component';

describe('SuperAdminOrganizationApprovalsComponent', () => {
  let component: SuperAdminOrganizationApprovalsComponent;
  let fixture: ComponentFixture<SuperAdminOrganizationApprovalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminOrganizationApprovalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminOrganizationApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
