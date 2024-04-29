import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Camera } from 'src/entity/camera.entity';
import { Employee } from 'src/entity/employee.entity';
import { DetectionController } from './detection.controller';
import { DetectionService } from './detection.service';
import { Embedded } from 'src/entity/embedded.entity';
import { Detection } from 'src/entity/detection.entity';
import { ImageCapture } from 'src/entity/image-capture.entity';
import { Organization } from 'src/entity/organization.entity';
import { ImgCaptureService } from '../img-capture/img-capture.service';
import { EmbeddedService } from '../embedded/embedded.service';
import { CameraService } from '../camera/camera.service';
import { EmployeeService } from '../employee/employee.service';
import { OrganizationService } from '../organization/organization.service';
import { HttpService } from 'src/http/http.service';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { UniqueData } from 'src/entity/unique-data.entity';
import { Repository } from 'typeorm';
import { AppGateway } from 'src/app.gateway';
import { FacialAlertService } from '../facial-alert/facial-alert.service';
import { Alert } from 'src/entity/alert.entity';
import { AlertDetection } from 'src/entity/alert-detection.entity';


@Module({
    imports: [TypeOrmModule.forFeature([
        Employee,
        Organization,
        Camera,
        Detection,
        Embedded,
        ImageCapture,
        UniqueColumn,
        UniqueData,
        Alert,
        AlertDetection

    ]),
    PassportModule.register({
        session: true
    })
    ],

    controllers: [DetectionController],

    providers: [
        DetectionService,
        ImgCaptureService,
        EmbeddedService,
        CameraService,
        EmployeeService,
        OrganizationService,
        HttpService,
        Repository,
        AppGateway,
        FacialAlertService,
    ],
})
export class DetectionModule { }
