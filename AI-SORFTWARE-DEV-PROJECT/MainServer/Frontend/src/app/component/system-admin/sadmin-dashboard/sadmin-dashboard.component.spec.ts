import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAdminDashboardComponent } from './sadmin-dashboard.component';

describe('SAdminDashboardComponent', () => {
  let component: SAdminDashboardComponent;
  let fixture: ComponentFixture<SAdminDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SAdminDashboardComponent]
    });
    fixture = TestBed.createComponent(SAdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
