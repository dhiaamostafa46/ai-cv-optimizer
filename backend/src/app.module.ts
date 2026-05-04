import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvModule } from './cv/cv.module';
import { CvEntity } from './cv/cv.entity';
import { AiModule } from './ai/ai.module';
import { StorageModule } from './storage/storage.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    QueueModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'cv_optimizer',
      entities: [CvEntity],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    AiModule,
    StorageModule,
    CvModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}