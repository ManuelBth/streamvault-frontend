import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
  pure: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength: number = 100, suffix: string = '...'): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value.length <= maxLength) {
      return value;
    }

    return value.substring(0, maxLength - suffix.length) + suffix;
  }
}
