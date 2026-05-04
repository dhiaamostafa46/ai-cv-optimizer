import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CvEntity } from './cv.entity';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { CvProcessor } from '../queue/cv.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([CvEntity]),
    BullModule.registerQueue({
      name: 'cv-processing',
    }),
    AiModule,
    StorageModule,
  ],
  controllers: [CvController],
  providers: [CvService, CvProcessor],
})
export class CvModule {}