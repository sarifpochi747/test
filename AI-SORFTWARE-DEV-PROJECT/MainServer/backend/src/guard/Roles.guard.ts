import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express"
import { Role, Roles } from "src/decorator/roles.decorator";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CameraClientDto } from "src/module/camera-client/dto/camera-client.dto";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector, 
        @Inject(CACHE_MANAGER) private cacheManager: Cache
        ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const rolesReq = this.reflector.get(Roles, context.getHandler());


        if(rolesReq.includes(Role.CAMERA)){
        const checkingAccessToken: CameraClientDto = await this.cacheManager.get(`${request.body.cameraId}`)
        if(checkingAccessToken && request.body.accessToken === checkingAccessToken?.accessToken) return true;
        }

        if(!request.session?.user) return false

        if (!rolesReq) return true;

        if(rolesReq.includes(Role.SYSTEMADMIN) && request.session?.user.isSystemAdmin) return true;

        if(rolesReq.includes(Role.ADMIN) && request.session?.user.isAdmin) return true;


        return false;
    }
}
