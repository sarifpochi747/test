import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from 'src/entity/employee.entity';
import { OrganizationService } from '../organization/organization.service';
import { EmbeddedService } from '../embedded/embedded.service';
import { Organization } from 'src/entity/organization.entity';
import { HttpService } from 'src/http/http.service';
import { Embedded } from 'src/entity/embedded.entity';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { UniqueData } from 'src/entity/unique-data.entity';
import { Repository } from 'typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([
        Employee,
        Organization,
        Embedded,
        UniqueColumn,
        UniqueData,
    ]),
    PassportModule.register({
        session: true
    })
    ],

    controllers: [EmployeeController],

    providers: [EmployeeService,OrganizationService,EmbeddedService,HttpService,Repository]
})
export class EmployeeModule { }
