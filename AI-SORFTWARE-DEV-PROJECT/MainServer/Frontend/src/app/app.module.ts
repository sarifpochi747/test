import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TitleStrategy } from '@angular/router';
import { AppTitlePostfix } from './app-title.postfix';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AuthService } from './service/auth/auth.service';
import { UserClient } from './service/user-client/user-client.service';
import { LoadingComponent } from './service/loading-transition/loading-transition.component';
import { LoadingInterceptor } from './service/loading-transition/loading-transition.interceptor';

import { LoginComponent } from './component/admin/login/login.component';
import { DashboardComponent } from './component/admin/dashboard/dashboard.component';
import { ProfileComponent } from './component/admin/profile/profile.component';
import { LeftMenuComponent } from './component/admin/left-menu/left-menu.component';
import { MemberComponent } from './component/admin/member/member.component';
import { TrackingComponent } from './component/admin/tracking/tracking.component';
import { AddMemberComponent } from './component/admin/add-member/add-member.component';
import { MemberProfileComponent } from './component/admin/member-profile/member-profile.component';
import { FacialAlertComponent } from './component/admin/facial-alert/facial-alert.component';
import { AlertInfoComponent } from './component/admin/alert-info/alert-info.component';
import { CameraComponent } from './component/admin/camera/camera.component';

import { SAdminLoginComponent } from './component/system-admin/sadmin-login/sadmin-login.component';
import { SAdminLeftMenuComponent } from './component/system-admin/sadmin-left-menu/sadmin-left-menu.component';
import { SAdminDashboardComponent } from './component/system-admin/sadmin-dashboard/sadmin-dashboard.component';
import { SAdminOrganizationComponent } from './component/system-admin/sadmin-organization/sadmin-organization.component';
import { SAdminOrganizationProfileComponent } from './component/system-admin/sadmin-organization-profile/sadmin-organization-profile.component';
import { SAdminAddOrganizationComponent } from './component/system-admin/sadmin-add-organization/sadmin-add-organization.component';
import { SAdminCameraComponent } from './component/system-admin/sadmin-camera/sadmin-camera.component';
import { WebcamModule } from 'ngx-webcam';
import { ToastrModule } from 'ngx-toastr';

import { PageNotFoundComponent } from './component/common/page-not-found/page-not-found.component';
import { TrackingDetailComponent } from './component/admin/tracking-detail/tracking-detail.component';
import { GreetingComponent } from './component/admin/greeting/greeting.component';
import { SAdminGreetingComponent } from './component/system-admin/sadmin-greeting/sadmin-greeting.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    ProfileComponent,
    PageNotFoundComponent,
    LeftMenuComponent,
    LoadingComponent,
    MemberComponent,
    TrackingComponent,
    AddMemberComponent,
    MemberProfileComponent,
    FacialAlertComponent,
    AlertInfoComponent,
    CameraComponent,
    SAdminLoginComponent,
    SAdminLeftMenuComponent,
    SAdminDashboardComponent,
    SAdminOrganizationComponent,
    SAdminOrganizationProfileComponent,
    SAdminAddOrganizationComponent,
    SAdminCameraComponent,
    TrackingDetailComponent,
    GreetingComponent,
    SAdminGreetingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    WebcamModule,
    ReactiveFormsModule,
    ToastrModule.forRoot()

  ],
  providers: [
    AuthService,
    UserClient,
    { provide: TitleStrategy, useClass: AppTitlePostfix },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

