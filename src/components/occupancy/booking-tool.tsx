"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { suggestBestBed, SuggestBestBedOutput } from "@/ai/flows/suggest-best-bed";

type BookingToolProps = {
  locationId: string;
};

export function BookingTool({ locationId }: BookingToolProps) {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState<SuggestBestBedOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FormSchema = z.object({
    startDate: z.date({
      required_error: "A start date is required.",
    }),
    endDate: z.date({
      required_error: "An end date is required.",
    }),
  }).refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    const input = {
      locationId: locationId,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
    };
    
    try {
        const result = await suggestBestBed(input);
        setSuggestion(result);
    } catch (e) {
        setError("An error occurred while fetching suggestion.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('startDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t('selectDate')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('endDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t('selectDate')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < (form.getValues("startDate") || new Date(new Date().setHours(0,0,0,0)))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('suggestBed')}
          </Button>
        </form>
      </Form>
      {(suggestion || error) && (
        <Card className={cn(error ? 'bg-destructive/20 border-destructive' : 'bg-accent/50')}>
          <CardContent className="p-4 space-y-2">
            <h4 className="font-medium">{t('suggestion')}</h4>
            {suggestion && (
                <>
                {suggestion.bedId && suggestion.bedId !== 'null' ? (
                    <div>
                        <p><span className="font-semibold">{t('suggestedBed')}:</span> {suggestion.bedId}</p>
                        <p className="text-sm text-muted-foreground mt-1"><span className="font-semibold">{t('reason')}:</span> {suggestion.reason}</p>
                    </div>
                ) : (
                    <p className="text-muted-foreground">{t('noBedAvailable')}: {suggestion.reason}</p>
                )}
                </>
            )}
            {error && (
              <p className="text-sm text-destructive-foreground">{error}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
