'use client';

import { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import type { AnalysisResult } from '@/types';
import { analyzeCV } from '@/lib/api';

interface CVUploaderProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: string) => void;
}

export default function CVUploader({ onAnalysisComplete, onError }: CVUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      onError('يرجى اختيار ملف السيرة الذاتية أولاً');
      return;
    }
    if (!jobDescription.trim()) {
      onError('يرجى إدخال وصف الوظيفة المستهدفة');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeCV(selectedFile, jobDescription, additionalNotes);
      onAnalysisComplete(result);
    } catch (error: any) {
      onError(error.response?.data?.message || error.message || 'حدث خطأ أثناء معالجة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card glass">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="input-group">
          <label htmlFor="jobDescription" className="block font-semibold mb-2">
            وصف الوظيفة المستهدفة
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="أدخل متطلبات الوظيفة هنا..."
            className="w-full h-32 bg-black/20 border border-glass-border rounded-xl p-4 text-white placeholder:text-text-secondary resize-none focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="additionalNotes" className="block font-semibold mb-2">
            ملاحظات إضافية / تحسينات مطلوبة
          </label>
          <textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="أدخل أي ملاحظات إضافية أو تحسينات ترغب بها..."
            className="w-full h-24 bg-black/20 border border-glass-border rounded-xl p-4 text-white placeholder:text-text-secondary resize-none focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <div className="drop-zone-content">
            <UploadCloud className="w-12 h-12 text-primary mb-4 mx-auto" />
            <p className="text-lg mb-2">اسحب ملف الـ CV هنا أو انقر للاختيار</p>
            <p className="text-sm text-text-secondary">يدعم PDF و Word (.pdf, .doc, .docx)</p>
          </div>
          <input
            type="file"
            id="fileInput"
            hidden
            accept=".pdf,.doc,.docx"
            onChange={handleFileInputChange}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 text-success">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>تم اختيار: {selectedFile.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="mr-auto text-sm text-primary hover:underline"
            >
              إلغاء
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full text-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="loader animate-spin" />
              <span>جاري التعديل والتحسين...</span>
            </>
          ) : (
            'تعديل الملف وتحسينه'
          )}
        </button>
      </form>
    </div>
  );
}