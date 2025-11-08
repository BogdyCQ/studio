"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, List, CalendarCheck } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';
import { Icons } from '@/components/icons';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from '@/components/ui/sidebar';

export function DashboardSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: t('map'), icon: Map, exact: true },
    { href: '/dashboard/locations', label: t('locations'), icon: List },
    { href: '/dashboard/bookings', label: t('myBookings'), icon: CalendarCheck },
  ];

  return (
    <Sidebar className="border-r hidden md:flex">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-semibold">{t('appName')}</span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
