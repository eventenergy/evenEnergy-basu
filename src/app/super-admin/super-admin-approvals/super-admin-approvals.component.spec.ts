import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminApprovalsComponent } from './super-admin-approvals.component';

describe('SuperAdminApprovalsComponent', () => {
  let component: SuperAdminApprovalsComponent;
  let fixture: ComponentFixture<SuperAdminApprovalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuperAdminApprovalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
