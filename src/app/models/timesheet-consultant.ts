export interface ActiveConsultant {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  clientEmail?: string
  status?: string
  poId?: string
  projectId?: string
  clientId?: string
  poNo?: string
  poTimesheetTemplateId?: string
  poTimesheetTemplateName?: string
  poTimesheetTemplateHeaderData?: Map<string, string>
  poTimesheetTemplateFileName?: string
  poStartDate?: string
  poEndDate?: string
  poTotalBudget?: number
  currency?: string
  pgWithRemoteAndOnsite?: boolean
  poStatus?: string
  pgId?: string
  pgName?: string
  pgTotalOnsiteHours?: number
  pgOnsiteRate?: number
  pgTotalOnsiteBudget?: number
  pgTotalOnsiteDays?: number
  pgTotalRemoteHours?: number
  pgRemoteRate?: number
  pgTotalRemoteBudget?: number
  pgTotalRemoteDays?: number
  pgStatus?: string
  pgConsultantId?: string
  pgConsultantAssignmentId?: string
  pgConsultantStartDate?: string
  pgConsultantEndDate?: string
  pgConsultantStatus?: string
  abrufId?: string
  abrufNo?: string
  abrufName?: string
  abrufStartDate?: string
  abrufEndDate?: string
  abrufStatus?: string
  projectName?: string
  projectLocation?: string
  projectAbrufRequired?: boolean
  projectStatus?: string
  clientShortName?: string
  clientLegalName?: string
  clientStatus?: string
  clientCreatedBy?: string
  clientCreatedTimestamp?: string
  timesheetGeneratedBy?: string
  timesheetGeneratedTimestamp?: string
  month?: number
  year?: number
  generationStatus?: string
  labels?: Labels
  endClientId?: string
  endClientName?: string
  resPersonId?: string
  resPersonName?: string
  vcId?: string
}

export interface Labels {
  labels?: Label[]
}

export interface Label {
  id?: string
  label?: string
}
