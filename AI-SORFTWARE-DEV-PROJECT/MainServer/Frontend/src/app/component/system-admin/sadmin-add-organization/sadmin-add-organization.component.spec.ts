import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAdminAddOrganizationComponent } from './sadmin-add-organization.component';

describe('SAdminAddOrganizationComponent', () => {
  let component: SAdminAddOrganizationComponent;
  let fixture: ComponentFixture<SAdminAddOrganizationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SAdminAddOrganizationComponent]
    });
    fixture = TestBed.createComponent(SAdminAddOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
