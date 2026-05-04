import { Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { CvService } from '../cv/cv.service';

@Processor('cv-processing')
export class CvProcessor {
  private readonly logger = new Logger(CvProcessor.name);

  constructor(private readonly cvService: CvService) {}

  @Process('analyze-cv')
  async handleAnalyzeJob(job: Job<{ filePath: string; jobId: number }>) {
    const { filePath, jobId } = job.data;
    this.logger.log(`Processing CV analysis job ${jobId} for file ${filePath}`);

    try {
      const result = await this.cvService.processAnalysisFromFile(filePath, jobId);
      this.logger.log(`Job ${jobId} completed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Job ${jobId} failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}