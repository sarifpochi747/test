import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAdminLeftMenuComponent } from './sadmin-left-menu.component';

describe('SAdminLeftMenuComponent', () => {
  let component: SAdminLeftMenuComponent;
  let fixture: ComponentFixture<SAdminLeftMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SAdminLeftMenuComponent]
    });
    fixture = TestBed.createComponent(SAdminLeftMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
