import { Module } from '@nestjs/common';
import { CameraClientService } from './camera-client.service';
import { CameraClientController } from './camera-client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camera } from 'src/entity/camera.entity';
import { CameraService } from '../camera/camera.service';
import { OrganizationService } from '../organization/organization.service';
import { Organization } from 'src/entity/organization.entity';
import { AppGateway } from 'src/app.gateway';
import { Repository } from 'typeorm';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { UniqueData } from 'src/entity/unique-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Camera,
    Organization,
    UniqueColumn,
    UniqueData
  ])],
  controllers: [CameraClientController],
  providers: [
    CameraClientService,
    CameraService,
    OrganizationService,
    AppGateway,
    Repository
  ]
})
export class CameraClientModule { }
