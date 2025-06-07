/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
// import * as functions from 'firebase-functions';
import axios from 'axios';
import { defineSecret } from 'firebase-functions/params';

// Define some parameters
const calendarApiKey = defineSecret('GOOGLE_CALENDAR_API_KEY');

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const allowedOrigins = ['http://localhost:4200'];
if (process.env.GCLOUD_PROJECT) {
  allowedOrigins.push(`https://${process.env.GCLOUD_PROJECT}.web.app`);
}

export const getCalendarEvents = onRequest(
  { cors: allowedOrigins },
  async (request, response) => {
    logger.info('getCalendarEvents called', { structuredData: true });

    const calendarId = request.query.calendarId;
    if (!calendarId) {
      response.status(400).send('Missing calendarId query parameter');
      return;
    }

    if (!calendarApiKey.value()) {
      response.status(500).send('API key not configured');
      return;
    }

    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${calendarApiKey.value()}&singleEvents=true&orderBy=startTime&timeMin=${now}&maxResults=100`;

    try {
      const googleResponse = await axios.get(url);
      response.send(googleResponse.data);
    } catch (error) {
      logger.error('Error fetching calendar events', error);
      response.status(500).send('Error fetching calendar events');
    }
  }
);
