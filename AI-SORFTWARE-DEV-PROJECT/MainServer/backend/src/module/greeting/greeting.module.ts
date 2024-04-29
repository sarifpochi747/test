import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { GreetingController } from './greeting.controller';
import { GreetingService } from './greeting.service';
import { Greeting } from 'src/entity/greeting.entity';
import { Organization } from 'src/entity/organization.entity';
import { OrganizationService } from '../organization/organization.service';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { Repository } from 'typeorm';
import { UniqueData } from 'src/entity/unique-data.entity';
import { AppGateway } from 'src/app.gateway';
import { CameraService } from '../camera/camera.service';
import { Camera } from 'src/entity/camera.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        Organization,
        Greeting,
        UniqueColumn,
        UniqueData,
        Camera,
        AppGateway
    ]),
    PassportModule.register({
        session: true
    })
    ],

    controllers: [GreetingController],

    providers: [GreetingService,OrganizationService,Repository,AppGateway,CameraService]
})
export class GreetingModule { }
