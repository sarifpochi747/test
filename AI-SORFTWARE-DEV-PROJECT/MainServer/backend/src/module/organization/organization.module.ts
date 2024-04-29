import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from 'src/entity/organization.entity';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { Repository } from 'typeorm';
import { UniqueData } from 'src/entity/unique-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Organization,
    UniqueColumn,
    UniqueData
  ]),
  PassportModule.register({
    session: true
  })
  ],
  controllers: [OrganizationController],

  providers: [OrganizationService,Repository]
})
export class OrganizationModule { }
