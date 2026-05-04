import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { Queue } from 'bull';
import { CvService } from './cv.service';
import { InjectQueue } from '@nestjs/bull';

@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    @InjectQueue('cv-processing')
    private readonly cvQueue: Queue,
  ) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeCv(
    @UploadedFile() file: any,
    @Body('jobDescription') jobDescription: string,
    @Body('additionalNotes') additionalNotes: string,
  ) {
    if (!file) {
      return { error: 'CV file is required' };
    }

    try {
      const cvText = await this.cvService.extractTextFromBuffer(
        file.buffer,
        file.mimetype,
      );

      const result = await this.cvService.analyzeAndOptimize(
        cvText,
        jobDescription,
        additionalNotes || '',
        file.originalname,
        file.buffer,
      );

      return result;
    } catch (error: any) {
      return {
        error: 'Failed to process CV',
        message: error.message,
      };
    }
  }

  @Post('analyze-async')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeCvAsync(
    @UploadedFile() file: any,
    @Body('jobDescription') jobDescription: string,
    @Body('additionalNotes') additionalNotes: string,
  ) {
    if (!file) {
      return { error: 'CV file is required' };
    }

    try {
      const cvText = await this.cvService.extractTextFromBuffer(
        file.buffer,
        file.mimetype,
      );

      const fileKey = await this.cvService.saveFileLocally(file.buffer, file.originalname);

      const record = await this.cvService.createAnalysisRecord(
        cvText,
        jobDescription,
        additionalNotes || '',
        file.originalname,
        fileKey,
      );

      await this.cvQueue.add('analyze-cv', {
        filePath: fileKey,
        jobId: record.id,
      });

      return {
        message: 'Analysis queued',
        jobId: record.id,
        status: 'pending',
      };
    } catch (error: any) {
      return {
        error: 'Failed to queue analysis',
        message: error.message,
      };
    }
  }

  @Post('download')
  async downloadDocx(@Body() analysisData: any, @Res() res: Response) {
    try {
      const buffer = await this.cvService.generateDocx(analysisData);
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename=Optimized_CV.docx',
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } catch (error) {
      res.status(500).send('Failed to generate document');
    }
  }

  @Get('history')
  async getHistory() {
    return await this.cvService.getHistory();
  }

  @Get(':id')
  async getAnalysis(@Query('id') id: number) {
    const result = await this.cvService.getAnalysisById(id);
    if (!result) {
      return { error: 'Analysis not found' };
    }
    return result;
  }

  @Get('status/:id')
  async getStatus(@Query('id') id: number) {
    const record = await this.cvService.getAnalysisById(id);
    if (!record) {
      return { error: 'Record not found' };
    }
    return {
      id: record.id,
      status: record.status,
      matchScore: record.matchScore,
      createdAt: record.createdAt,
      processedAt: record.processedAt,
      errorMessage: record.errorMessage,
    };
  }
}