import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SAdminCameraComponent } from './sadmin-camera.component';

describe('SAdminCameraComponent', () => {
  let component: SAdminCameraComponent;
  let fixture: ComponentFixture<SAdminCameraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SAdminCameraComponent]
    });
    fixture = TestBed.createComponent(SAdminCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
