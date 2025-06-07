import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'customDateFormat'
})
export class CustomDateFormatPipe implements PipeTransform {
  transform(value: string): string {
    const date = moment(value, 'DD.MM.YYYY');
    return date.isValid() ? date.format('DD MMM YY') : '';
  }
}
