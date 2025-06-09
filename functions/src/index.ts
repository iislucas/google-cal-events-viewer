/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import axios from 'axios';
import { defineSecret } from 'firebase-functions/params';

const calendarApiKey = defineSecret('GOOGLE_CALENDAR_API_KEY');

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const allowedOrigins = ['http://localhost:4200'];
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
  async (request) => {
    logger.info('getCalendarEvents called with data:', request.data);

    if (!calendarApiKey.value()) {
      logger.error('Google Calendar API key is not configured.');
      throw new HttpsError(
        'failed-precondition',
        'The function is not configured correctly. Please contact the administrator.'
      );
    }

    const { calendarId, q } = request.data;
    if (typeof calendarId !== 'string' || !calendarId) {
      logger.warn('Missing or invalid calendarId parameter.', {
        data: request.data,
      });
      throw new HttpsError(
        'invalid-argument',
        'The function must be called with a "calendarId" argument.'
      );
    }

    const now = new Date().toISOString();
    const maxResults = 100;
    let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${calendarApiKey.value()}&singleEvents=true&orderBy=startTime&timeMin=${now}&maxResults=${maxResults}`;

    if (typeof q === 'string' && q) {
      url += `&q=${encodeURIComponent(q)}`;
    }

    try {
      logger.info('Calling Google Calendar API.', { url });
      const googleResponse = await axios.get(url);
      logger.info('Successfully fetched calendar events.');
      return googleResponse.data;
    } catch (error) {
      let errorMessage = 'An unexpected error occurred.';
      let errorCode: any = 'unknown';

      if (axios.isAxiosError(error)) {
        logger.error('Axios error fetching calendar events from Google:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        errorMessage = 'Failed to fetch calendar events from Google.';
        errorCode = 'internal';
      } else {
        logger.error('Unknown error fetching calendar events:', error);
      }

      throw new HttpsError(errorCode, errorMessage);
    }
  }
);
