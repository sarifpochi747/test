import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacialAlertComponent } from './facial-alert.component';

describe('FacialAlertComponent', () => {
  let component: FacialAlertComponent;
  let fixture: ComponentFixture<FacialAlertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacialAlertComponent]
    });
    fixture = TestBed.createComponent(FacialAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
