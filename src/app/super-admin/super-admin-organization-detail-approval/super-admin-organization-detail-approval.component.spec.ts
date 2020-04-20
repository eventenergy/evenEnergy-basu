import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminOrganizationDetailApprovalComponent } from './super-admin-organization-detail-approval.component';

describe('SuperAdminOrganizationDetailApprovalComponent', () => {
  let component: SuperAdminOrganizationDetailApprovalComponent;
  let fixture: ComponentFixture<SuperAdminOrganizationDetailApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminOrganizationDetailApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminOrganizationDetailApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
