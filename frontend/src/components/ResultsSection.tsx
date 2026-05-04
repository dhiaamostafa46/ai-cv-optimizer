'use client';

import { useEffect, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import type { AnalysisResult } from '@/types';
import { downloadCV } from '@/lib/api';

interface ResultsSectionProps {
  result: AnalysisResult;
}

export default function ResultsSection({ result }: ResultsSectionProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadCV(result);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Optimized_CV_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('حدث خطأ أثناء تحميل الملف');
    }
  };

  const score = result.matchScore || 0;
  const scoreColor =
    score >= 75 ? 'text-success' : score >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <section className="results-section fade-in">
      <div className="stats-grid mb-8">
        {/* Match Score Card */}
        <div className="card glass stat-card">
          <h3 className="text-center mb-4 text-text-secondary">نسبة التوافق</h3>
          <div className="score-circle relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2.8"
              />
              <path
                id="scorePath"
                className="circle"
                strokeDasharray={`${score}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                style={{
                  color: score >= 75 ? '#10b981' : score >= 50 ? '#eab308' : '#ef4444',
                  transition: 'stroke-dasharray 1s ease-in-out',
                }}
              />
              <text
                x="18"
                y="20.35"
                className="percentage"
                fill="white"
                fontSize="8"
                textAnchor="middle"
                fontFamily="Outfit, sans-serif"
                fontWeight="700"
              >
                {score}%
              </text>
            </svg>
          </div>
        </div>

        {/* Missing Keywords Card */}
        <div className="card glass keyword-card">
          <h3 className="mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            كلمات مفتاحية مفقودة
          </h3>
          {result.missingKeywords && result.missingKeywords.length > 0 ? (
            <div className="pills-container">
              {result.missingKeywords.map((keyword, idx) => (
                <span key={idx} className="pill">
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary italic">ممتاز! لا توجد كلمات مفتاحية مفقودة</p>
          )}
        </div>
      </div>

      {/* Optimized Content */}
      <div className="optimized-sections grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Professional Summary */}
        <div className="card glass">
          <h3 className="mb-4 text-lg font-semibold">الملخص المهني المحسّن</h3>
          <div className="content-box min-h-[200px] whitespace-pre-wrap leading-relaxed">
            {result.optimizedFullCv?.summary || 'لم يتم توليد ملخص'}
          </div>
          <button
            onClick={() => handleCopy(result.optimizedFullCv?.summary || '', 'summary')}
            className="btn btn-secondary btn-sm mt-3 inline-flex items-center gap-2"
          >
            {copiedField === 'summary' ? (
              <>
                <Check className="w-4 h-4" />
                تم النسخ!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                نسخ المحتوى
              </>
            )}
          </button>
        </div>

        {/* Work Experience */}
        <div className="card glass">
          <h3 className="mb-4 text-lg font-semibold">الخبرات والمهارات المحسّنة</h3>
          <div className="content-box min-h-[200px] whitespace-pre-wrap leading-relaxed">
            {result.optimizedFullCv?.experience || 'لم يتم توليد خبرات'}
          </div>
          <button
            onClick={() => handleCopy(result.optimizedFullCv?.experience || '', 'experience')}
            className="btn btn-secondary btn-sm mt-3 inline-flex items-center gap-2"
          >
            {copiedField === 'experience' ? (
              <>
                <Check className="w-4 h-4" />
                تم النسخ!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                نسخ المحتوى
              </>
            )}
          </button>
        </div>
      </div>

      {/* Download Button */}
      <div className="download-container text-center">
        <button
          onClick={handleDownload}
          className="btn btn-primary max-w-md inline-flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          تحميل السيرة الذاتية المعدلة (Word)
        </button>
      </div>
    </section>
  );
}