import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Organization } from 'src/entity/organization.entity';
import { SystemAdmin } from 'src/entity/system-admin.entity';
import { OrganizationService } from '../organization/organization.service';
import { SystemAdminService } from '../system-admin/system-admin.service';
import { CameraClientService } from '../camera-client/camera-client.service';
import { CameraService } from '../camera/camera.service';
import { Camera } from 'src/entity/camera.entity';
import { AppGateway } from 'src/app.gateway';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { Repository } from 'typeorm';
import { UniqueData } from 'src/entity/unique-data.entity';
@Module({
    imports: [TypeOrmModule.forFeature([
        Organization,
        SystemAdmin,
        Camera,
        UniqueColumn,
        UniqueData
    ]),
    PassportModule.register({
        session: true
    })
    ],

    controllers: [AuthController],

    providers: [
        AuthService,
        OrganizationService,
        SystemAdminService,
        CameraClientService,
        CameraService,
        AppGateway,
        Repository,
    ]
})
export class AuthModule { }
