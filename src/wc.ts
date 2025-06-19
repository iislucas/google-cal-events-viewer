import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { EventListComponent } from './app/event-list/event-list.component';
import { appConfig } from './app/app.config.wc';

(async () => {
  const app = await createApplication(appConfig);
  const eventListElement = createCustomElement(EventListComponent, {
    injector: app.injector,
  });
  customElements.define('event-list-component', eventListElement);
})();

/* 
 <script>

      // Wait for the component to be defined and in the DOM
      customElements.whenDefined('event-list-component').then(() => {
        const component = document.querySelector('event-list-component') as any;
        if (!component) {
          console.error('event-list-component not found in the DOM');
          return;
        }

        // Function to update URL query parameters
        const updateQueryParam = (key: string, value: string | null) => {
          const url = new URL(window.location.href);
          if (value) {
            url.searchParams.set(key, value);
          } else {
            url.searchParams.delete(key);
          }
          // Use replaceState to avoid adding to browser history
          window.history.replaceState({}, '', url.toString());
        };

        // Set initial values from URL to the component properties
        const urlParams = new URLSearchParams(window.location.search);
        const calendarId = component.calendarId || urlParams.get('calendarId');
        const q = urlParams.get('q');
        const qServer = urlParams.get('qServer');

        if (calendarId) {
          component.calendarId = calendarId;
        }
        if (q) {
          component.clientSideSearchQuery = q;
        }
        if (qServer) {
          component.serverSideSearchQuery = qServer;
        }

        // Listen for output events from the component
        component.addEventListener('calendarIdChange', (event: Event) => {
          updateQueryParam('calendarId', (event as CustomEvent<string>).detail);
        });

        component.addEventListener('clientSideSearchChange', (event: Event) => {
          updateQueryParam('q', (event as CustomEvent<string>).detail);
        });

        component.addEventListener('serverSideSearchChange', (event: Event) => {
          updateQueryParam('qServer', (event as CustomEvent<string>).detail);
        });
      });
    </script>
    */
