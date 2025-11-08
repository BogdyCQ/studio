// This page is no longer needed with the new reservation system.
// Bookings are now managed directly on the bed documents.
// You can safely delete this file.

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

export default function BookingsPage() {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-headline mb-6">{t('yourBookings')}</h1>
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">{t('bookingsMoved')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
