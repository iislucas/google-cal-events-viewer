import { Injectable } from '@angular/core';
import { ICONS } from './icons/icon-data';

export type IconData = (typeof ICONS)[string];

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private registry = new Map<string, IconData>();

  constructor() {
    for (const key in ICONS) {
      if (Object.prototype.hasOwnProperty.call(ICONS, key)) {
        this.registry.set(key, ICONS[key]);
      }
    }
  }

  getIconData(name: string): IconData | undefined {
    return this.registry.get(name);
  }
}
