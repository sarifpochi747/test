import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAdminGreetingComponent } from './sadmin-greeting.component';

describe('SAdminGreetingComponent', () => {
  let component: SAdminGreetingComponent;
  let fixture: ComponentFixture<SAdminGreetingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SAdminGreetingComponent]
    });
    fixture = TestBed.createComponent(SAdminGreetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
