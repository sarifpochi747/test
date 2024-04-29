import { Camera } from 'src/entity/camera.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CameraController } from './camera.controller';
import { CameraService } from './camera.service';
import { Organization } from 'src/entity/organization.entity';
import { OrganizationService } from '../organization/organization.service';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { Repository } from 'typeorm';
import { UniqueData } from 'src/entity/unique-data.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        Organization,
        Camera,
        UniqueColumn,
        UniqueData
    ]),
    PassportModule.register({
        session: true
    })
    ],

    controllers: [CameraController],

    providers: [CameraService,OrganizationService,Repository]
})
export class CameraModule { }
