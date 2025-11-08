'use client';

import { useTranslation } from "@/hooks/use-translation";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Booking } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsPage() {
    const { t } = useTranslation();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/bookings`));
    }, [firestore, user]);

    const { data: bookings, loading: bookingsLoading } = useCollection<Booking>(bookingsQuery);

    const isLoading = isUserLoading || bookingsLoading;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline">{t('yourBookings')}</h1>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('bookingId')}</TableHead>
                                <TableHead>{t('bedId')}</TableHead>
                                <TableHead>{t('startDate')}</TableHead>
                                <TableHead>{t('endDate')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    </TableRow>
                                ))
                            ) : bookings && bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell><Badge variant="outline">{booking.id}</Badge></TableCell>
                                        <TableCell>{booking.bedId}</TableCell>
                                        <TableCell>{format(new Date(booking.startDate), "PPP")}</TableCell>
                                        <TableCell>{format(new Date(booking.endDate), "PPP")}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        {t('noBookings')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
