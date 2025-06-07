export enum Messages {
  closeConfirm = 'Are you sure you want to close this form? Any unsaved changes will be lost.',
  statusDraftToActive = ' Do you want to change the project status from Draft to Active?',
  projectStatusChangeModalText = 'Project Status Change',
  deleteAbruf = 'Are you sure you want to delete this Abruf?',
  deleteAbrufHeading = 'Delete Abruf',
  noAbrufText = 'No Abruf created for this project, please create one Abruf to complete PO creation.',
  noAbrufHeading = 'No Abruf',
  deleteConsultant = 'Are you sure you want to delete this consultant?',
  deleteConsultantTitle = 'Delete Consultant',
  deletePo = 'Are you sure you want to delete this PO?',
  deletePoHeading = 'Delete PO',
  deletePg = 'Are you sure you want to delete this PG?',
  deletePgHeading = 'Delete PG',
  deleteProjectHeading = 'Delete Project',
  deleteClient = 'Delete Client',
  removeClientProjectHeading = 'Remove Client',
  confirmGeneration = 'Are you sure you want to start timesheet generation?',
  confirmRegeneration = 'Are you sure you want to start timesheet regeneration?',

  /** Delete message for abruf inside the modal*/
  deleteAbrufMessage = 'This Abruf has PO(s) assigned to it. Please delete PO(s) first',
  /** Delete message for PO inside the modal*/
  deletePoMessage = 'Consultants are already assigned in the PG for this PO.',

  deleteConsultantMessage = 'This Consultant cannot be deleted as it is assigned to PG',
  removeConsultantHeading = 'Remove Consultant',
  removeConsultantFromPG = 'Are you sure you want to remove this Consultant?',
  removeConsultantFromPGMessage = 'This Consultant cannot be removed as there are timesheet entries',
  noEndDateMessage = 'No End Date in the consultant. Please enter the end date',
  deleteProjectMessages = 'You cannot delete this project as PO is associated with it.',
  deleteProjectOverview = 'Are you sure you want to delete this project and any Abruf associated with it? This action cannot be undone.',
  uncheckRemoteAndOnsite = 'Unchecking this checkbox will set all values in the remote sections of all PGs in this PO to 0. Do you want to continue?',
  uncheckHeading = 'Uncheck Remote and Onsite',
  deleteClientMessages = 'This client is already associated with a project. You can not delete this client',
  deleteClientMessagePopUp = 'Are you sure you want to delete this Client?',
  removeClientProjectWarning = 'Are you sure you want to remove this client from the project?',
  removeClientProjectMessage = 'Either Abruf or PO exists for this client in this project.',

  // Delete Template Messages and Strings
  deleteTemplateTitle = 'Delete Template',
  deleteTemplateMessage = 'Are you sure you want to delete this template?',
  deleteTemplateSuccess = 'Template deleted successfully.',
  deleteTemplateError = 'Failed to delete template.',

  //Delete Timesheet Messages and String
  deleteTimesheet = 'Are you sure you want to delete this timesheet?',
  deleteTimesheetTitle = 'Delete Timesheet',

  //Delete Milestone
  deleteMilestone = 'Are you sure you want to delete this milestone?',
  deleteMilestoneTitle = 'Delete Milestone',
  noAbrufTextForMilestone = 'No Abruf created for this project, please create one Abruf to create a Milestone.',

  //Delete Comment
  deleteComment = 'Are you sure you want to delete this comment?',
  deleteCommentTitle = 'Delete Comment',

  //Unmatch Timesheet
  unmatchTimesheet = 'Are you sure you want to cancel the matched timesheet?',
  unmatchTimesheetTitle = 'Cancel Matched Timesheet',
}
