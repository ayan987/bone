import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'importwarningCount', pure: true })
export class ImportWarningCountPipe implements PipeTransform {
  transform(statusesData: { datetime: string, statusHistory: any[] }): number {
    const match = statusesData.statusHistory.find(item => item.datetime === statusesData.datetime);
    return match?.totalWarnings ?? 0;
  }
}
