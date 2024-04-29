import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAdminLoginComponent } from './sadmin-login.component';

describe('SAdminLoginComponent', () => {
  let component: SAdminLoginComponent;
  let fixture: ComponentFixture<SAdminLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SAdminLoginComponent]
    });
    fixture = TestBed.createComponent(SAdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
