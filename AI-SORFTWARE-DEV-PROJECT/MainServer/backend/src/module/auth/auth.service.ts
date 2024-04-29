import * as bcrypt from 'bcryptjs';
import { Status } from 'src/declarations/status';
import { SystemAdmin } from 'src/entity/system-admin.entity';
import { Organization } from 'src/entity/organization.entity';
import { OrganizationData } from 'src/declarations/organization';
import { OrganizationService } from '../organization/organization.service';
import { SystemAdminService } from '../system-admin/system-admin.service';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {

    constructor(
        private orgService: OrganizationService,
        private systemAdminService: SystemAdminService
    ) { }

    async validateAdmin(data: requestLogin): Promise<OrganizationData | undefined> {

        const admin: Organization = await this.orgService.findByEmail(data.email);
        if (!admin) throw new NotFoundException('Email not found');

        const hash: string = admin.password;
        const isMatch: boolean = await bcrypt.compare(data.password, hash);
        if (!isMatch) throw new UnauthorizedException("password is incorrect");

        const status: Status = admin.organizeStatus;

        if (status == Status.DISABLE) {
            throw new UnauthorizedException("Unauthorized status : Disable");
        }

        const organizationData: OrganizationData = {
            organizationId: admin.organizationId,
            email: admin.email,
            organizationName: admin.organizationName,
            address: admin.address,
            phone: admin.phone,
            organizeStatus: admin.organizeStatus
        }
        return organizationData
    }

    async validateSystemAdmin(data: requestLogin): Promise<SystemAdminData> {

        const systemAdmin: SystemAdmin = await this.systemAdminService.findByEmail(data.email);
        if (!systemAdmin) throw new NotFoundException('Email not found');

        const hash: string = systemAdmin.password;
        const isMatch: boolean = await bcrypt.compare(data.password, hash);
        if (!isMatch) throw new UnauthorizedException("password is incorrect");

        return systemAdmin
    }

}

