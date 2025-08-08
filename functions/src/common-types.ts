export type GetCalendarEventsRequest = { calendarId: string } & Partial<{
  q: string;
  singleEvents: boolean;
  orderBy: string;
  timeMin: string;
  timeMax: string;
  maxResults: number;
}>;

// Define interfaces for the Google Calendar API response
export type GoogleCalendarEventItem = {
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
  htmlLink: string;
};
export type GoogleCalendarResponse = {
  items?: GoogleCalendarEventItem[];
};

export type GetVimeoShowcaseRequest = { showcaseId: string };

export type VimeoVideoItem = {
  uri: string;
  name: string;
  description: string | null;
  link: string;
  duration: number;
  pictures: {
    base_link: string;
    sizes: {
      width: number;
      height: number;
      link: string;
      link_with_play_button: string;
    }[];
  };
  created_time: string;
};

export type VimeoShowcaseResponse = {
  items: VimeoVideoItem[];
};
