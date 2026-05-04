import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('cv_analyses')
export class CvEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  originalFileName: string;

  @Column({ type: 'text', nullable: true })
  filePath: string; // S3 key or local path

  @Column({ type: 'text' })
  cvText: string;

  @Column({ type: 'text' })
  jobDescription: string;

  @Column({ type: 'text', nullable: true })
  additionalNotes: string;

  @Column({ type: 'int', nullable: true })
  matchScore: number;

  @Column({ type: 'text', nullable: true })
  optimizedSummary: string;

  @Column({ type: 'text', nullable: true })
  optimizedExperience: string;

  @Column({ type: 'json', nullable: true })
  analysisResult: any;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;
}