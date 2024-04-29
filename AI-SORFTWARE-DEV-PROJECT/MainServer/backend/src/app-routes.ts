import { Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { AuthModule } from './module/auth/auth.module';
import { CameraModule } from './module/camera/camera.module';
import { DetectionModule } from './module/detection/detection.module';
import { EmbeddedModule } from './module/embedded/embedded.module';
import { EmployeeModule } from './module/employee/employee.module';
import { GreetingModule } from './module/greeting/greeting.module';
import { ImgCaptureModule } from './module/img-capture/img-capture.module';
import { ModelModule } from './module/model/model.module';
import { OrganizationModule } from './module/organization/organization.module';
import { SystemAdminModule } from './module/system-admin/system-admin.module';
import { CameraClientModule } from './module/camera-client/camera-client.module';
import { FacialAlertModule } from './module/facial-alert/facial-alert.module';

const routes: Routes = [
  { path: "auth", module: AuthModule },
  { path: "camera", module: CameraModule },
  { path: "camera-client", module: CameraClientModule },
  { path: "detection", module: DetectionModule },
  { path: "embedded", module: EmbeddedModule },
  { path: "employee", module: EmployeeModule },
  { path: "greeting", module: GreetingModule },
  { path: "img-capture", module: ImgCaptureModule },
  { path: "model", module: ModelModule },
  { path: "organization", module: OrganizationModule },
  { path: "facial-alert", module: FacialAlertModule },
  { path: "system-admin", module: SystemAdminModule },
];

@Module({
  imports: [
    AuthModule,
    CameraModule,
    CameraClientModule,
    DetectionModule,
    EmbeddedModule,
    EmployeeModule,
    GreetingModule,
    ImgCaptureModule,
    ModelModule,
    OrganizationModule,
    SystemAdminModule,
    FacialAlertModule,
    RouterModule.register(routes)
  ],
  exports: [RouterModule],
})
export class ApiRoutesModule { }
