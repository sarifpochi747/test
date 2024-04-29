import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entity/employee.entity';
import { Organization } from './entity/organization.entity';
import { SystemAdmin } from './entity/system-admin.entity';
import { Camera } from './entity/camera.entity';
import { Detection } from './entity/detection.entity';
import { ImageCapture } from './entity/image-capture.entity';
import { Model } from './entity/model.enitity';
import { Embedded } from './entity/embedded.entity';
import { Greeting } from './entity/greeting.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ApiRoutesModule } from './app-routes';
import { AppGateway } from './app.gateway';
import { HttpService } from './http/http.service';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { UniqueColumn } from './entity/unique-column.entity';
import { UniqueData } from './entity/unique-data.entity';
import { Alert } from './entity/alert.entity';
import { AlertDetection } from './entity/alert-detection.entity';
import { FacialAlertModule } from './module/facial-alert/facial-alert.module';
import { CameraService } from './module/camera/camera.service';
import { OrganizationService } from './module/organization/organization.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true
    }),

    ThrottlerModule.forRoot([{
      ttl: Number(process.env.LIMIT_TTL),
      limit: Number(process.env.LIMIT_REQUESTCOUNT),
    }]),

    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PW,
      database: process.env.DB_DBNAME,
      autoLoadEntities: true,
      entities: [
        Employee,
        Organization,
        SystemAdmin,
        Camera,
        Detection,
        ImageCapture,
        Model,
        Embedded,
        Greeting,
        UniqueColumn,
        UniqueData,
        Alert,
        AlertDetection
      ],
      synchronize: true
    }),

    TypeOrmModule.forFeature([
      Organization,
      Camera,
      UniqueColumn,
      UniqueData,
      AppGateway
    ]),

    CacheModule.register(process.env.CACHESTORE === "memory" ? { isGlobal: true }
      : {
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        isGlobal: true
      }),
      
    ApiRoutesModule,
    FacialAlertModule,
  ],

  controllers: [AppController],
  providers: [AppService, AppGateway, HttpService, CameraService, OrganizationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
