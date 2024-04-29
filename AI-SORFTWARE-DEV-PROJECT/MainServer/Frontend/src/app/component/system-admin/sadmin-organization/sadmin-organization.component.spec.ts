import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAdminOrganizationComponent } from './sadmin-organization.component';

describe('SAdminOrganizationComponent', () => {
  let component: SAdminOrganizationComponent;
  let fixture: ComponentFixture<SAdminOrganizationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SAdminOrganizationComponent]
    });
    fixture = TestBed.createComponent(SAdminOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
