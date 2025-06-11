// status-to-class.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TimesheetStatus } from '../models/timesheet-status-enum';

const STATUS_CLASS_MAP: Record<TimesheetStatus, string> = {
  [TimesheetStatus.error]: 'text-red-600',
  [TimesheetStatus.genqueued]: 'text-pending',
  [TimesheetStatus.emailqueued]: 'text-pending',
  [TimesheetStatus.started]: 'text-blue',
  [TimesheetStatus.generated]: 'text-green',
  [TimesheetStatus.imported]: 'text-green',
  [TimesheetStatus.notsent]: 'text-pending',
  [TimesheetStatus.notneeded]: 'text-pending',
  [TimesheetStatus.tsdeleted]: 'text-red-600',
  [TimesheetStatus.sent]: 'text-green',
  [TimesheetStatus.correctionNeeded]: 'text-pending',
  [TimesheetStatus.emailBounced]: 'text-red-600',
  [TimesheetStatus.unmatched]: 'text-red-600',
  [TimesheetStatus.tsChecked]: 'text-green',
  [TimesheetStatus.tsApproved]: 'text-green',
  [TimesheetStatus.tsRejeted]: 'text-red-600',
  [TimesheetStatus.tsInvoiced]: 'text-green',
  [TimesheetStatus.tsSentToClient]: 'text-green',
  [TimesheetStatus.tsSentToClientError]: 'text-red-600',
  [TimesheetStatus.tsMatchedManually]: 'text-green',
  [TimesheetStatus.importedTimesheetUnmatched]: 'text-pending',
  [TimesheetStatus.importedTimesheetMatched]: 'text-green',
  [TimesheetStatus.firstLevelApproval]: 'text-green',
  [TimesheetStatus.secondLevelApproval]: 'text-green',
};

@Pipe({ name: 'statusToColor', pure: true })
export class StatusToColorPipe implements PipeTransform {
  transform(statusKey: TimesheetStatus): string {
    return STATUS_CLASS_MAP[statusKey] ?? '';
  }
}
