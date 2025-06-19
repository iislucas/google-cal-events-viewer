import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { EventListComponent } from './app/event-list/event-list.component';
import { appConfig } from './app/app.config';

(async () => {
  const app = await createApplication(appConfig);
  const eventListElement = createCustomElement(EventListComponent, {
    injector: app.injector,
  });
  customElements.define('event-list-component', eventListElement);
})();
