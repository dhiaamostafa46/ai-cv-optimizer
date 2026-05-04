'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Copy, Check } from 'lucide-react';
import type { AnalysisResult, CvHistoryItem } from '@/types';
import { getHistory } from '@/lib/api';

interface HistorySectionProps {
  onViewAnalysis: (id: number) => void;
}

export default function HistorySection({ onViewAnalysis }: HistorySectionProps) {
  const [history, setHistory] = useState<CvHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="history-section">
        <div className="card glass">
          <div className="text-center py-8">جاري تحميل السجل...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="history-section">
      <div className="card glass history-card">
        <div className="card-header flex items-center gap-2 mb-6">
          <FileText className="w-6 h-6 text-primary" />
          <h3>سجل التحليلات السابقة</h3>
        </div>
        <div className="history-table-container overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-right py-3 px-4 text-text-secondary font-semibold text-sm uppercase">
                  التاريخ
                </th>
                <th className="text-right py-3 px-4 text-text-secondary font-semibold text-sm uppercase">
                  اسم الملف
                </th>
                <th className="text-right py-3 px-4 text-text-secondary font-semibold text-sm uppercase">
                  نسبة التوافق
                </th>
                <th className="text-right py-3 px-4 text-text-secondary font-semibold text-sm uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-secondary">
                    لا توجد سجلات سابقة
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-glass-border hover:bg-white/5 transition-colors fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="py-4 px-4">
                      {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-4 px-4">{item.originalFileName}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          (item.matchScore || 0) >= 75
                            ? 'bg-success/20 text-success border border-success/30'
                            : (item.matchScore || 0) >= 50
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {item.matchScore || 0}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => onViewAnalysis(item.id)}
                        className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        عرض
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}