import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'germanToEnglishDate',
})
export class GermanToEnglishDatePipe implements PipeTransform {
  transform(value: string): string {
    let returnValue = '';
    let isDDMMYYYYFormat = moment(value, 'DD.MM.YYYY', true).isValid();

    const germanMonths: Record<string, string> = {
      // full month names
      januar: 'Jan',
      februar: 'Feb',
      märz: 'Mar',
      april: 'Apr',
      mai: 'May',
      juni: 'Jun',
      juli: 'Jul',
      august: 'Aug',
      september: 'Sep',
      oktober: 'Oct',
      november: 'Nov',
      dezember: 'Dec',
      // abbreviations
      jan: 'Jan',
      feb: 'Feb',
      mär: 'Mar',
      mar: 'Mar',
      apr: 'Apr',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Aug',
      sep: 'Sep',
      okt: 'Oct',
      nov: 'Nov',
      dez: 'Dec',
    };

    if (isDDMMYYYYFormat) {
      const date = moment(value, 'DD.MM.YYYY', true);
      returnValue = date.format('MMM YYYY');
    } else {
      // Try to parse "Month Year" in German
      const parts = value.trim().split(/\s+/);
      if (parts.length === 2) {
        const monthStr = parts[0].toLowerCase();
        const yearStr = parts[1];

        if (germanMonths[monthStr] && /^\d{4}$/.test(yearStr)) {
          returnValue = germanMonths[monthStr] + ' ' + yearStr;
        } else {
          returnValue = 'Invalid Date';
        }
      } else {
        returnValue = 'Invalid Date';
      }
    }

    return returnValue;
  }
}
