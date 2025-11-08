"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardSidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // The AuthProvider shows a loading skeleton, so this can be null while
    // the initial auth state is determined.
    return null;
  }

  return (
    <SidebarProvider defaultOpen>
        <div className="flex h-screen w-full">
          <DashboardSidebar />
          <div className="flex flex-col flex-1 w-full overflow-hidden">
            <DashboardHeader />
            <main className="h-full overflow-y-auto bg-background">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
    </SidebarProvider>
  );
}
