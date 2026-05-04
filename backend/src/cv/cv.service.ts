import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CvEntity } from './cv.entity';
import { GeminiService } from '../ai/ai.service';
import { S3Service } from '../storage/s3.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CvService implements OnModuleInit {
  private readonly logger = new Logger(CvService.name);
  private readonly uploadDir: string;
  private readonly useLocalStorage: boolean;

  constructor(
    @InjectRepository(CvEntity)
    private cvRepository: Repository<CvEntity>,
    private readonly dataSource: DataSource,
    private readonly geminiService: GeminiService,
    private readonly s3Service: S3Service,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.useLocalStorage = process.env.USE_LOCAL_STORAGE === 'true';
  }

  async onModuleInit() {
    if (this.useLocalStorage) {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Upload directory ready: ${this.uploadDir}`);
    }
  }

  async extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return await this.extractPdfText(buffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return await this.extractDocxText(buffer);
    }
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  }

  private async extractDocxText(buffer: Buffer): Promise<string> {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  async saveFileLocally(buffer: Buffer, filename: string): Promise<string> {
    const uniqueName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(this.uploadDir, uniqueName);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.doc':
        return 'application/msword';
      default:
        return 'application/octet-stream';
    }
  }

  async createAnalysisRecord(
    cvText: string,
    jobDescription: string,
    additionalNotes: string,
    originalFileName: string,
    filePath: string,
  ): Promise<CvEntity> {
    const record = this.cvRepository.create({
      cvText,
      jobDescription,
      additionalNotes: additionalNotes || '',
      originalFileName,
      filePath,
      status: 'pending',
    });
    return await this.cvRepository.save(record);
  }

  async analyzeAndOptimize(
    cvText: string,
    jobDescription: string,
    additionalNotes: string,
    originalFileName: string,
    fileBuffer: Buffer,
  ): Promise<{
    id: number;
    matchScore: number;
    missingKeywords: string[];
    optimizedFullCv: {
      summary: string;
      experience: string;
      skills: string;
    };
  }> {
    // Use transaction to ensure atomic operation
    const result = await this.dataSource.transaction(async (manager) => {
      let fileKey: string;

      if (this.useLocalStorage) {
        fileKey = await this.saveFileLocally(fileBuffer, originalFileName);
      } else {
        fileKey = this.s3Service.generateFileKey('uploads', originalFileName);
        await this.s3Service.uploadFile(
          fileKey,
          fileBuffer,
          this.getMimeType(originalFileName),
        );
      }

      const record = this.cvRepository.create({
        cvText,
        jobDescription,
        additionalNotes: additionalNotes || '',
        originalFileName,
        filePath: fileKey,
        status: 'pending',
      });

      const savedRecord = await manager.save(record);

      const analysis = await this.geminiService.analyzeCV(
        cvText,
        jobDescription,
        additionalNotes,
      );

      savedRecord.matchScore = analysis.matchScore;
      savedRecord.optimizedSummary = analysis.optimizedFullCv.summary;
      savedRecord.optimizedExperience = analysis.optimizedFullCv.experience;
      savedRecord.analysisResult = analysis;
      savedRecord.status = 'completed';
      savedRecord.processedAt = new Date();

      await manager.save(savedRecord);

      this.logger.log(`Analysis completed for record ID: ${savedRecord.id}`);

      return {
        id: savedRecord.id,
        ...analysis,
      };
    });

    return result;
  }

  async processAnalysisFromFile(filePath: string, jobId: number): Promise<any> {
    let buffer: Buffer;
    let originalFileName = 'unknown';

    if (this.useLocalStorage) {
      buffer = await fs.readFile(filePath);
      originalFileName = path.basename(filePath);
    } else {
      buffer = await this.s3Service.getFile(filePath);
      originalFileName = path.basename(filePath);
    }

    const cvText = await this.extractTextFromBuffer(
      buffer,
      this.getMimeType(originalFileName),
    );

    const record = await this.cvRepository.findOne({
      where: { id: jobId },
    });

    if (!record) {
      throw new Error(`Record ${jobId} not found`);
    }

    record.status = 'processing';
    await this.cvRepository.save(record);

    try {
      const analysis = await this.geminiService.analyzeCV(
        cvText,
        record.jobDescription,
        record.additionalNotes,
      );

      record.matchScore = analysis.matchScore;
      record.optimizedSummary = analysis.optimizedFullCv.summary;
      record.optimizedExperience = analysis.optimizedFullCv.experience;
      record.analysisResult = analysis;
      record.status = 'completed';
      record.processedAt = new Date();

      await this.cvRepository.save(record);
      return analysis;
    } catch (error) {
      record.status = 'failed';
      record.errorMessage = error.message;
      await this.cvRepository.save(record);
      throw error;
    }
  }

  async generateDocx(analysisData: {
    optimizedFullCv: {
      summary: string;
      experience: string;
      skills: string;
    };
  }): Promise<Buffer> {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'Optimized Resume',
              heading: HeadingLevel.HEADING_1,
              alignment: 'center',
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'Professional Summary',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [new TextRun({ text: analysisData.optimizedFullCv.summary || '' })],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'Work Experience',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [new TextRun({ text: analysisData.optimizedFullCv.experience || '' })],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'Key Skills',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [new TextRun({ text: analysisData.optimizedFullCv.skills || '' })],
            }),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  async getHistory(limit = 10) {
    return await this.cvRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'originalFileName', 'matchScore', 'createdAt', 'status'],
    });
  }

  async getAnalysisById(id: number) {
    return await this.cvRepository.findOne({
      where: { id },
      select: [
        'id',
        'originalFileName',
        'matchScore',
        'optimizedSummary',
        'optimizedExperience',
        'analysisResult',
        'createdAt',
        'status',
      ],
    });
  }
}