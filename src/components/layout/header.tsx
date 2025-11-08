"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "./language-switcher";
import { UserNav } from "./user-nav";

export function DashboardHeader() {
    return (
        <header className="sticky top-0 z-30 w-full bg-card/80 backdrop-blur-sm border-b">
            <div className="container flex h-16 items-center space-x-4 px-4 sm:px-6 lg:px-8">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                <div className="flex-1" />
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <LanguageSwitcher />
                    <UserNav />
                </div>
            </div>
        </header>
    );
}
