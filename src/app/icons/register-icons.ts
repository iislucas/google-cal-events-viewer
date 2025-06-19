/*
Usage: 
```ts
import { registerIcons } from 'src/icons/register-icons';

// In a component class constructor...
  addIcons(['calendar_today', ... ]);
```
*/

import { inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export function registerIcons(names: string[]) {
  const iconRegistry = inject(MatIconRegistry);
  const sanitizer = inject(DomSanitizer);
  for (const name of names) {
    iconRegistry.addSvgIcon(
      name,
      sanitizer.bypassSecurityTrustResourceUrl(`./icons/${name}.svg`)
    );
  }
}
