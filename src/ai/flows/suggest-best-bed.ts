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
import {getFirestore} from 'firebase-admin/firestore';
import { initializeServerFirebase } from '@/firebase/server';
import type {Bed} from '@/lib/types';
import {parseISO, areIntervalsOverlapping} from 'date-fns';

// Initialize Firestore for the server
initializeServerFirebase();
const firestore = getFirestore();

const BedSchema = z.object({
  id: z.string(),
  bedNumber: z.string(),
  roomId: z.string(),
  locationId: z.string(),
  description: z.string().optional(),
  reservations: z
    .array(
      z.object({
        id: z.string(),
        clientName: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .optional(),
});
const BedsForLocationSchema = z.array(BedSchema);

const getBedsForLocation = ai.defineTool(
  {
    name: 'getBedsForLocation',
    description: 'Retrieves all beds and their reservation data for a specific location.',
    inputSchema: z.object({locationId: z.string()}),
    outputSchema: BedsForLocationSchema,
  },
  async ({locationId}) => {
    console.log(`Tool: Fetching beds for locationId: ${locationId}`);
    const bedsQuery = firestore
      .collectionGroup('beds')
      .where('locationId', '==', locationId);
    
    const querySnapshot = await bedsQuery.get();
    
    // Sanitize the data to return plain objects
    const beds = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        bedNumber: data.bedNumber,
        roomId: data.roomId,
        locationId: data.locationId,
        description: data.description,
        reservations: data.reservations || []
      } as Bed;
    });

    console.log(`Tool: Found ${beds.length} beds.`);
    return beds;
  }
);

const SuggestBestBedInputSchema = z.object({
  locationId: z.string().describe('The ID of the location.'),
  startDate: z.string().describe('The desired start date for the bed (YYYY-MM-DD).'),
  endDate: z.string().describe('The desired end date for the bed (YYYY-MM-DD).'),
});
export type SuggestBestBedInput = z.infer<typeof SuggestBestBedInputSchema>;

const SuggestBestBedOutputSchema = z.object({
  bedId: z.string().describe('The ID of the suggested bed, or "null" if no bed is available.'),
  roomId: z.string().describe('The ID of the room for the suggested bed.'),
  reason: z.string().describe('The reason for the bed suggestion, or why none was available.'),
});
export type SuggestBestBedOutput = z.infer<typeof SuggestBestBedOutputSchema>;

export async function suggestBestBed(input: SuggestBestBedInput): Promise<SuggestBestBedOutput> {
  // Manual date validation before calling the flow
  try {
    const start = parseISO(input.startDate);
    const end = parseISO(input.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { bedId: 'null', roomId: 'null', reason: 'Invalid date format provided. Please use YYYY-MM-DD.' };
    }
    if (start > end) {
      return { bedId: 'null', roomId: 'null', reason: 'The start date cannot be after the end date.' };
    }
  } catch (e) {
    return { bedId: 'null', roomId: 'null', reason: 'An error occurred while parsing dates.' };
  }

  return suggestBestBedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBestBedPrompt',
  tools: [getBedsForLocation],
  prompt: `You are a helpful assistant that suggests the best available bed for a given location and date range.
  
  User's request:
  - Location ID: {{{locationId}}}
  - Desired Start Date: {{{startDate}}}
  - Desired End Date: {{{endDate}}}
  
  Your task is to:
  1. Use the 'getBedsForLocation' tool to fetch all beds for the provided locationId.
  2. Analyze the 'reservations' for each bed. A bed is unavailable if the user's desired date range overlaps with any existing reservation.
  3. The desired interval is { start: {{{startDate}}}, end: {{{endDate}}} }.
  4. An existing reservation interval is { start: reservation.startDate, end: reservation.endDate }.
  5. Check for overlaps: A desired range overlaps with a reservation if (desired.start <= reservation.end) and (desired.end >= reservation.start).
  6. Find the first bed that has NO overlapping reservations with the user's desired date range.
  7. If you find an available bed, return its 'bedId' and 'roomId'. For the 'reason', state that the bed is available for the requested period.
  8. If ALL beds are unavailable for the requested dates, return "null" for 'bedId' and 'roomId', and for the 'reason', explain that no beds are available for the selected period.
  9. If the tool returns no beds, state that the location has no beds.`,
});

const suggestBestBedFlow = ai.defineFlow(
  {
    name: 'suggestBestBedFlow',
    inputSchema: SuggestBestBedInputSchema,
    outputSchema: SuggestBestBedOutputSchema,
  },
  async (input) => {
    console.log('Flow: Starting suggestion flow with input:', input);
    const llmResponse = await prompt(input);
    const toolCalls = llmResponse.toolRequests();

    if (toolCalls.length > 0) {
      console.log(`Flow: LLM requested ${toolCalls.length} tool(s).`);
      
      const toolResponses = [];
      for (const toolRequest of toolCalls) {
        console.log(`Flow: Executing tool: ${toolRequest.name}`);
        const output = await toolRequest.run();
        toolResponses.push({
          toolRequest,
          output,
        });
      }

      console.log('Flow: Tool execution finished. Sending results back to LLM for final processing.');
      
      // Let the LLM process the tool output to give the final answer
      const finalResponse = await llmResponse.continue(toolResponses);
      return finalResponse.output()!;

    } else {
        // If the LLM returns a response without calling a tool
        const directOutput = llmResponse.output();
        if (directOutput) {
            console.log('Flow: LLM provided a direct answer.');
            return directOutput;
        }
    }
    
    console.log('Flow: No tool calls and no direct output from LLM.');
    return { bedId: 'null', roomId: 'null', reason: 'Could not determine bed availability.' };
  }
);
