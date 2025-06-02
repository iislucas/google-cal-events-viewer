import { Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component'; // Import EventListComponent

export const routes: Routes = [
  { path: '', component: EventListComponent }, // Set EventListComponent as the default route
];
