import { Module } from '@nestjs/common';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminService } from './system-admin.service';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAdmin } from 'src/entity/system-admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    // Employee,
    // Organization,
    SystemAdmin,
    // Camera,
    // Detection,
    // Embedded,
    // ImageCapture,
    // Model,
    // Greeting
  ]),
  PassportModule.register({
    session: true
  })
  ],

  controllers: [SystemAdminController],
  providers: [SystemAdminService]

})
export class SystemAdminModule { }
