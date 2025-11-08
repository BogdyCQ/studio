"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function AvailabilityCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // In a real app, you would fetch bookings and mark them on the calendar
  const today = new Date();
  const occupiedDays = [
    new Date(today.getFullYear(), today.getMonth(), 8),
    new Date(today.getFullYear(), today.getMonth(), 9),
    new Date(today.getFullYear(), today.getMonth(), 20),
  ];
  const reservedDays = [
    new Date(today.getFullYear(), today.getMonth(), 12),
    new Date(today.getFullYear(), today.getMonth(), 15),
    new Date(today.getFullYear(), today.getMonth(), 16),
  ];

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border p-0"
      modifiers={{
        occupied: occupiedDays,
        reserved: reservedDays,
      }}
      modifiersClassNames={{
        occupied: 'bg-destructive/20 text-destructive-foreground/60',
        reserved: 'bg-primary/20',
      }}
    />
  );
}
