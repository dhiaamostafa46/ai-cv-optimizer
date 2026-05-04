'use client';

import { useState } from 'react';
import { UploadCloud, Download, FileText, History } from 'lucide-react';
import CVUploader from '@/components/CVUploader';
import ResultsSection from '@/components/ResultsSection';
import HistorySection from '@/components/HistorySection';
import type { AnalysisResult } from '@/types';

export default function HomePage() {
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setCurrentResult(result);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleViewAnalysis = (id: number) => {
    alert(`عرض تفاصيل السجل رقم ${id}`);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <header className="hero text-center">
        <h1 className="text-5xl font-bold mb-6">
          حسّن سيرتك الذاتية{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            بذكاء
          </span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          ارفع ملفك وأدخل بيانات الوظيفة، وسنقوم بتحليلها وتعديلها لتناسب متطلبات الوظيفة تماماً
          باستخدام الذكاء الاصطناعي
        </p>
      </header>

      {/* Main Upload Section */}
      <section className="upload-section max-w-3xl mx-auto">
        <CVUploader onAnalysisComplete={handleAnalysisComplete} onError={handleError} />

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}
      </section>

      {/* Results Section */}
      {currentResult && (
        <ResultsSection result={currentResult} />
      )}

      {/* History Section */}
      <HistorySection onViewAnalysis={handleViewAnalysis} />
    </div>
  );
}