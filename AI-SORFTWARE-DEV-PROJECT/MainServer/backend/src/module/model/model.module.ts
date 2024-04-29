import { Module } from '@nestjs/common';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from 'src/entity/model.enitity';
import { Organization } from 'src/entity/organization.entity';
import { OrganizationService } from '../organization/organization.service';
import { UniqueColumn } from 'src/entity/unique-column.entity';
import { Repository } from 'typeorm';
import { UniqueData } from 'src/entity/unique-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Organization,
    Model,
    UniqueColumn,
    UniqueData
  ]),
  PassportModule.register({
    session: true
  })
  ],

  controllers: [ModelController],
  providers: [ModelService, OrganizationService, Repository]

})
export class ModelModule { }
