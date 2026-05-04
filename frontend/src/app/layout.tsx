import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مساعد السيرة الذاتية الذكي | CV Optimizer AI',
  description: 'نظام ذكي لإدارة وتحسين السير الذاتية يعمل كمساعد مهني باستخدام تقنيات الذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased min-h-screen">
        <nav className="navbar flex justify-between items-center p-6 bg-[rgba(15,23,42,0.8)] backdrop-blur-[10px] sticky top-0 z-50 border-b border-glass-border">
          <div className="logo flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xl font-bold font-['Outfit']">CV Optimizer AI</span>
          </div>
          <div className="nav-links flex gap-6">
            <a href="#" className="active text-primary font-semibold">
              الرئيسية
            </a>
            <a href="#" className="text-text-secondary hover:text-primary transition-colors">
              عن النظام
            </a>
            <a href="#" className="text-text-secondary hover:text-primary transition-colors">
              المميزات
            </a>
          </div>
        </nav>

        <main className="container max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="footer text-center py-8 text-text-secondary border-t border-glass-border mt-16">
          <p>© 2026 CV Optimizer AI - جميع الحقوق محفوظة</p>
        </footer>
      </body>
    </html>
  );
}