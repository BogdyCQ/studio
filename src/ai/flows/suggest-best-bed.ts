'use server';

/**
 * @fileOverview A flow to suggest the best available bed based on occupancy data and desired dates.
 *
 * - suggestBestBed - A function that suggests the most suitable available bed.
 * - SuggestBestBedInput - The input type for the suggestBestBed function.
 * - SuggestBestBedOutput - The return type for the suggestBestBed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBestBedInputSchema = z.object({
  locationId: z.string().describe('The ID of the location.'),
  startDate: z.string().describe('The desired start date for the bed (YYYY-MM-DD).'),
  endDate: z.string().describe('The desired end date for the bed (YYYY-MM-DD).'),
});
export type SuggestBestBedInput = z.infer<typeof SuggestBestBedInputSchema>;

const SuggestBestBedOutputSchema = z.object({
  bedId: z.string().describe('The ID of the suggested bed, or null if no bed is available.'),
  reason: z.string().describe('The reason for the bed suggestion.'),
});
export type SuggestBestBedOutput = z.infer<typeof SuggestBestBedOutputSchema>;

export async function suggestBestBed(input: SuggestBestBedInput): Promise<SuggestBestBedOutput> {
  return suggestBestBedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBestBedPrompt',
  input: {schema: SuggestBestBedInputSchema},
  output: {schema: SuggestBestBedOutputSchema},
  prompt: `You are a helpful assistant that suggests the best available bed based on the provided occupancy data and desired dates.

  Consider the following:
  - Location ID: {{{locationId}}}
  - Start Date: {{{startDate}}}
  - End Date: {{{endDate}}}

  Analyze the available beds and their occupancy status for the given location and dates.
  Suggest the most suitable bed based on availability.
  If no beds are available, return null for the bedId.
  Explain the reasoning for the bed suggestion in the reason field.
  Ensure that dates are formatted as YYYY-MM-DD.
  Ensure that the dates are parsed to perform the availability check.
  If the input dates are invalid, return an error.`,
});

const suggestBestBedFlow = ai.defineFlow(
  {
    name: 'suggestBestBedFlow',
    inputSchema: SuggestBestBedInputSchema,
    outputSchema: SuggestBestBedOutputSchema,
  },
  async input => {
    try {
      // Validate input dates
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
          bedId: 'null',
          reason: 'Invalid date format. Please use YYYY-MM-DD.',
        };
      }

      if (start > end) {
        return {
          bedId: 'null',
          reason: 'Start date cannot be after end date.',
        };
      }

      const {output} = await prompt(input);
      return output!;
    } catch (error: any) {
      console.error('Error in suggestBestBedFlow:', error);
      return {
        bedId: 'null',
        reason: `An unexpected error occurred: ${error.message || error}`,
      };
    }
  }
);
