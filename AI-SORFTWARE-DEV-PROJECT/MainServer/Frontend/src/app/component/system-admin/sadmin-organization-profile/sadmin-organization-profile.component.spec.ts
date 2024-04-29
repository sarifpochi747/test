import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAdminOrganizationProfileComponent } from './sadmin-organization-profile.component';

describe('SAdminOrganizationProfileComponent', () => {
  let component: SAdminOrganizationProfileComponent;
  let fixture: ComponentFixture<SAdminOrganizationProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SAdminOrganizationProfileComponent]
    });
    fixture = TestBed.createComponent(SAdminOrganizationProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
