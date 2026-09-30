import './globals.css';
import Providers from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AtsAuthModal from '@/components/analysis/AtsAuthModal';

export const metadata = {
  title: 'TrustFlow AI — AI Resume Intelligence & ATS/CCS Platform',
  description:
    'AI-powered resume-building, ATS/CCS analysis, job-discovery and job-specific resume optimization platform. Awaring students that their resumes are incompetent for the practical IT world.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AtsAuthModal />
        </Providers>
      </body>
    </html>
  );
}
