import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

import { apiClient } from '@/lib/api-client';

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await apiClient.getSiteSettings();
  const siteName = siteSettings.name || 'PaperCam PSC';
  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`
    },
    description: siteSettings.description || 'Premier Kerala PSC Learning Platform',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
