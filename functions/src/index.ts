/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from 'firebase-functions/v2/https';
import { environment } from './environment/environment';
import { calendarApiKey, getCalendarEventsCallFn } from './get-calendar';
const allowedOrigins = environment.domains;
if (process.env.GCLOUD_PROJECT) {
  allowedOrigins.push(`https://${process.env.GCLOUD_PROJECT}.web.app`);
}

/**
 * Fetches events from a public Google Calendar.
 * This is a callable function that can be invoked from a client app.
 *
 * @param {{calendarId: string}} data - The data passed to the function.
 * @param {string} data.calendarId - The ID of the Google Calendar to fetch events from.
 * @returns {Promise<any>} A promise that resolves with the calendar events from the Google API.
 * @throws {HttpsError} Throws an error if:
 *  - The API key is not configured ('failed-precondition').
 *  - The calendarId is missing or invalid ('invalid-argument').
 *  - There's an error fetching data from the Google Calendar API ('internal' or 'unknown').
 */
export const getCalendarEvents = onCall(
  { secrets: [calendarApiKey], cors: allowedOrigins },
  getCalendarEventsCallFn
);
