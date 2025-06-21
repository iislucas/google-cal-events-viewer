import { Component, computed, inject, input } from '@angular/core';
import { IconService } from '../icon.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    xmlns="http://www.w3.org/2000/svg"
    [attr.viewBox]="viewbox()"
    [attr.fill]="computedFill()"
    [attr.width]="computedWidth()"
    [attr.height]="computedHeight()"
    [innerHTML]="svgContent()"
  ></svg>`,
  host: {
    '[style.width]': 'computedWidth()',
    '[style.height]': 'computedHeight()',
    style: 'display: inline-block',
  },
})
export class IconComponent {
  name = input.required<string>();
  width = input<string>();
  height = input<string>();
  fill = input<string>();

  iconService = inject(IconService);
  sanitizer = inject(DomSanitizer);

  private iconData = computed(() => this.iconService.getIconData(this.name()));

  viewbox = computed(() => this.iconData()?.viewbox);
  computedWidth = computed(() => this.width() || this.iconData()?.width);
  computedHeight = computed(() => this.height() || this.iconData()?.height);
  computedFill = computed(() => this.fill() || this.iconData()?.fill);

  svgContent = computed(() => {
    const html = this.iconData()?.html;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : '';
  });
}
