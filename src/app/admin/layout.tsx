import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

export const metadata = {
  title: 'Admin Control Center | Kerala PSC Pro',
  description: 'Enterprise Content Management System & Admin Dashboard for Kerala PSC Courses and Exams.',
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
