export enum TimesheetStatus {
  generated = 'GENERATED',
  error = 'GEN_ERROR',
  started = 'GEN_STARTED',
  genqueued = 'GEN_QUEUED',
  emailqueued = 'EMAIL_QUEUED',
  notneeded = 'GEN_NOT_NEEDED',
  tsdeleted = 'TS_DELETED',
  sent = 'EMAIL_SENT',
  imported = 'TS_IMPORT_MATCHED',
  notsent = 'NOT_SENT',
  correctionNeeded = 'CORRECTION_NEEDED',
  emailBounced = 'EMAIL_BOUNCED',
  unmatched = 'TS_IMPORTED_UNMATCHED',
  tsChecked = 'TS_CHECKED',
  tsApproved = 'TS_APPROVED',
  tsRejeted = 'TS_REJECTED',
  tsInvoiced = 'TS_INVOICED',
  tsSentToClient = 'TS_SENT_TO_CLIENT',
  tsSentToClientError = 'TS_SENT_TO_CLIENT_ERROR',
  tsMatchedManually = 'TS_IMPORT_MANUALLY_MATCHED',

  // Imported timesheet statuses for import_timeheet table data
  importedTimesheetUnmatched = 'UNMATCHED',
  importedTimesheetMatched = 'IMPORTED',
}
