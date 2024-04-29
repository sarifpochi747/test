import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { EmbeddedController } from './embedded.controller';
import { EmbeddedService } from './embedded.service';
import { OrganizationService } from '../organization/organization.service';
import { EmployeeService } from '../employee/employee.service';
import { Embedded } from 'src/entity/embedded.entity';
import { Employee } from 'src/entity/employee.entity';
import { Organization } from 'src/entity/organization.entity';
import { HttpService } from 'src/http/http.service';
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

    controllers: [EmbeddedController],

    providers: [EmbeddedService,EmployeeService,OrganizationService,HttpService,Repository]
})
export class EmbeddedModule { }
