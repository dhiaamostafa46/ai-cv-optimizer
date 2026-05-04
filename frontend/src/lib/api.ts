import axios from 'axios';
import type { AnalysisResult, CvHistoryItem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeCV = async (
  file: File,
  jobDescription: string,
  additionalNotes?: string
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobDescription', jobDescription);
  formData.append('additionalNotes', additionalNotes || '');

  const response = await api.post<AnalysisResult>('/cv/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const downloadCV = async (analysisData: AnalysisResult): Promise<Blob> => {
  const response = await api.post<Blob>('/cv/download', analysisData, {
    responseType: 'blob',
  });
  return response.data;
};

export const getHistory = async (): Promise<CvHistoryItem[]> => {
  const response = await api.get<CvHistoryItem[]>('/cv/history');
  return response.data;
};