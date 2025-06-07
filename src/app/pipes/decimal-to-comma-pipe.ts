import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalToComma'
})
export class DecimalToCommaPipe implements PipeTransform {

  transform(value: number | string): string {
    if (value == null) return '';
    const stringValue = value.toString();
    return stringValue.replace('.', ',');
  }
}
