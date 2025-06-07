export interface GeneratedTimesheet {
  id?: string;
  clientName?: string;
  projectName?: string;
  abrufId?: string;
  abrufName?: string;
  abrufStartDate?: string;
  abrufEndDate?: string;
  clientEmail?: string;
  pgConsultantId?: string;
  pgConsultantStartDate?: string;
  pgConsultantEndDate?: string;
  poNo?: string;
  poStartDate?: string;
  poEndDate?: string;
  pgName?: string;
  generationStatus?: string;
  timesheetGeneratedBy?: string;
  timesheetGeneratedTimestamp?: string;
  month?: number;
  year?: number;
  hours?: string;
  labels: Labels;
  poTimesheetTemplateName?: string
  poTimesheetTemplateFileName?: string
  poTimesheetTemplateId?: string
  poTimesheetTemplateHeaderData?: any
  endDateMonthYear: any;
  clientShortName?: string
  lastName?: string;
  firstName?: string;
  generatedTSPath?: string;
  batchId?: string ;
  emailGenerationStatus?: string;
  emailBatchId?: string;
  statuses?: any;
}

export interface Labels {
  labels?: Label[]
}

export interface Label {
  id?: string
  label?: string
}
