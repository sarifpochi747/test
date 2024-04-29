import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageNotFoundComponent } from "./component/common/page-not-found/page-not-found.component";
import { LoginComponent } from "./component/admin/login/login.component"
import { DashboardComponent } from "./component/admin/dashboard/dashboard.component"
import { ProfileComponent } from './component/admin/profile/profile.component';
import { MemberComponent } from './component/admin/member/member.component';
import { TrackingComponent } from './component/admin/tracking/tracking.component';
import { TrackingDetailComponent } from './component/admin/tracking-detail/tracking-detail.component';
import { AddMemberComponent } from './component/admin/add-member/add-member.component';
import { MemberProfileComponent } from './component/admin/member-profile/member-profile.component';
import { FacialAlertComponent } from './component/admin/facial-alert/facial-alert.component';
import { AlertInfoComponent } from './component/admin/alert-info/alert-info.component';
import { CameraComponent } from './component/admin/camera/camera.component';
import { GreetingComponent } from './component/admin/greeting/greeting.component';

import { SAdminLoginComponent } from './component/system-admin/sadmin-login/sadmin-login.component';
import { SAdminDashboardComponent } from './component/system-admin/sadmin-dashboard/sadmin-dashboard.component';
import { SAdminOrganizationComponent } from './component/system-admin/sadmin-organization/sadmin-organization.component';
import { SAdminAddOrganizationComponent } from './component/system-admin/sadmin-add-organization/sadmin-add-organization.component';
import { SAdminOrganizationProfileComponent } from './component/system-admin/sadmin-organization-profile/sadmin-organization-profile.component';
import { SAdminCameraComponent } from './component/system-admin/sadmin-camera/sadmin-camera.component';
import { SAdminGreetingComponent } from './component/system-admin/sadmin-greeting/sadmin-greeting.component';

import { AuthService } from './service/auth/auth.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthService], title: 'Dashboard' },
  { path: 'all-member', component: MemberComponent, canActivate: [AuthService], title: 'Members' },
  { path: 'add-member', component: AddMemberComponent, canActivate: [AuthService], title: 'Members' },
  { path: 'member', component: MemberProfileComponent, canActivate: [AuthService], title: 'Members' },
  { path: 'member/:memberId', component: MemberProfileComponent, canActivate: [AuthService], title: 'Members' },
  { path: 'tracking', component: TrackingComponent, canActivate: [AuthService], title: 'Tracking' },
  { path: 'tracking-detail/:imagecaptureId', component: TrackingDetailComponent, canActivate: [AuthService], title: 'Tracking Detail' },
  { path: 'facial-alert', component: FacialAlertComponent, canActivate: [AuthService], title: 'Facial Alert' },
  { path: 'alert-info/:alertId', component: AlertInfoComponent, canActivate: [AuthService], title: 'Facial Alert' },
  { path: 'camera', component: CameraComponent, canActivate: [AuthService], title: 'Camera' },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthService], title: 'Profile' },
  { path: 'greeting', component: GreetingComponent, canActivate: [AuthService], title: 'Greeting' },

  { path: 'system-admin/login', component: SAdminLoginComponent, title: 'Login' },
  { path: 'system-admin/dashboard', component: SAdminDashboardComponent, canActivate: [AuthService], title: 'Dashboard' },
  { path: 'system-admin/all-organization', component: SAdminOrganizationComponent, canActivate: [AuthService], title: 'Organization' },
  { path: 'system-admin/add-organization', component: SAdminAddOrganizationComponent, canActivate: [AuthService], title: 'Organization' },
  { path: 'system-admin/organization/:organizationId', component: SAdminOrganizationProfileComponent, canActivate: [AuthService], title: 'Organization' },
  { path: 'system-admin/camera', component: SAdminCameraComponent, canActivate: [AuthService], title: 'Camera' },
  { path: 'system-admin/greeting', component: SAdminGreetingComponent, canActivate: [AuthService], title: 'Greeting' },

  { path: 'system-admin',  redirectTo: 'system-admin/dashboard', pathMatch: 'prefix' },
  { path: '',  redirectTo: 'dashboard', pathMatch: 'prefix' },
  { path: '**', component: PageNotFoundComponent, title: 'Notfound' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
