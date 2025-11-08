"use client";

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardSidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is finished and there's no user.
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // While loading, or if there's no user yet (and we're about to redirect),
  // show a loading state to prevent content flash.
  if (isUserLoading || !user) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Icons.logo className="h-16 w-16 animate-pulse text-primary/50" />
        </div>
      </div>
    );
  }

  // Once loading is complete and we have a user, render the dashboard.
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
