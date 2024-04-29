import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserClient } from '../user-client/user-client.service';
type role = 'admin' | 'system-admin'

interface RouterRoles {
  [route: string]: {
    role?: role,
    pass?: string,
    notpass?: string
  },
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private readonly ProtectedRoute: RouterRoles = {
    "admin": {
      role: 'admin',
      notpass: '/system-admin/dashboard'
    },
    "system-admin": {
      role: 'system-admin',
      notpass: 'login'
    },
  }

  constructor(private readonly user: UserClient, private readonly router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const path = route.routeConfig?.path || '';
    let pathRequirePermission: role = path.includes('system-admin') ? 'system-admin' : 'admin';

    const RequiredPermission = this.ProtectedRoute[pathRequirePermission] || {}

    if (RequiredPermission.role === "admin" && (await this.user.isSessionAdmin())) {
      return true;
    }

    if (RequiredPermission.role === "system-admin" && (await this.user.isSessionSystemAdmin())) {
      return true;
    }

    this.routeNavigate();
    return false;
  }

  routeNavigate() {
    let path: string = 'login';

    if (this.user.client.isAdmin ) {
      path = 'dashboard';
    } else if (this.user.client.isSystemAdmin) {
      path = 'system-admin/dashboard';
    }

    this.router.navigate([path]);
  }
  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
