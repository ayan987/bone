// const baseUrl = 'http://18.209.246.91:';
// const clientPort = '52000';
// // const clientPort = '52005';
// const projectPort = '52001';
// const clientProjectPort = '52002';
// const timesheetCollectionPort = '52010';
// // const projectPort = '52004';
// const consltantPort = '52006';
// const documentPort = '52008'; // DEV
// // const documentPort = '52009'; // QA
//--------------------------------------------------------------------------
// dev in firebase
// const baseUrl = 'https://utho.bosenet.com:';
// const clientPort = '52024/bos1';
// const projectPort = '52028/bos1';
// const clientProjectPort = '52020/bos1';
// const timesheetCollectionPort = '52030/bos1';
// const consltantPort = '52022/bos1';
// const documentPort = '52026/bos1';
const baseUrl = 'https://utho.bosenet.com';
const clientPort = '/bos1/dev/clients';
const projectPort = '/bos1/dev/projects';
const clientProjectPort = '/bos1/dev/core';
const timesheetCollectionPort = '/bos1/dev/ts';
const consltantPort = '/bos1/dev/consultants';
const documentPort = '/bos1/dev/documents';
//--------------------------------------------------------------------
// dev
// const baseUrl = 'http://89.47.59.178:';
// const clientPort = '52000/bos1';
// const projectPort = '52001/bos1';
// const clientProjectPort = '52002/bos1';
// const timesheetCollectionPort = '52010/bos1';
// const consltantPort = '52006/bos1';
// const documentPort = '52008/bos1';

const clientService = '/bosenetone/service/v1/clients';
const projectService = '/bosenetone/service/v1/projects';
const assignClientService = '/bosenetone/service/v1/pca/assign-clients';
const projectOverviewService = '/bosenetone/service/v1/overview';
const abrufService = '/bosenetone/service/v1/pca/abruf';
const abrufEditService = '/bosenetone/service/v1/pca/update/abruf';
const deleteAbrufService = '/bosenetone/service/v1/pca'
const assignedClientProjectService = '/bosenetone/service/v1/pca';
const poService = '/bosenetone/service/v1/po';
const timesheetService = '/bosenetone/service/v1/timesheet';
const consultantService = '/bosenetone/service/v1/consultants';
const documentService = '/bosenetone/service/v1/documents';
const activeConsultantService = '/bosenetone/service/v1/activeConsultant';
const holidayService = '/bosenetone/service/v1/holidayWithLocation';
const timesheetLabelService = '/bosenetone/service/v1/labels';
const emailService = '/bosenetone/service/v1/email';
const postmarkEmailService = '/bosenetone/service/v1/postmark';
const endClientService = '/bosenetone/service/v1/endclients';
const milestoneService = '/bosenetone/service/v1/milestones';
const importTimesheetService = '/bosenetone/service/v1/importTimesheet';
const commentService = '/bosenetone/service/v1/comments';

export const environment = {
  redirectUri: 'https://bosenetonedev.web.app/',
  // redirectUri: 'http://localhost:4200/',
  msClientId: '79434a65-8027-4a9e-9ced-3af183c70a32',
  msGraphApiUrl: 'https://graph.microsoft.com/v1.0/',
  firebase: {
    apiKey: "AIzaSyCQpEhGkslsnCwOl3kemFwwWscjF5qv6No",
    authDomain: "bosenetoneqa.firebaseapp.com",
    projectId: "bosenetoneqa",
    storageBucket: "bosenetoneqa.firebasestorage.app",
    messagingSenderId: "69636022049",
    appId: "1:69636022049:web:bf63ff759269f5d212e860"
  },
  clientServiceUrl: baseUrl + clientPort + clientService,
  projectServiceUrl: baseUrl + projectPort + projectService,
  clientProjectServiceUrl: baseUrl + clientProjectPort + assignClientService,
  abrufServiceUrl: baseUrl + clientProjectPort + abrufService,
  poServiceUrl: baseUrl + clientProjectPort + poService,
  timesheetServiceUrl: baseUrl + clientProjectPort + timesheetService,
  projectOverviewServiceUrl: baseUrl + clientProjectPort + projectOverviewService,
  assignedClientProjectServiceUrl: baseUrl + clientProjectPort + assignedClientProjectService,
  abrufEditServiceUrl: baseUrl + clientProjectPort + abrufEditService,
  deleteAbrufServiceUrl: baseUrl + clientProjectPort + deleteAbrufService,
  consultantServiceUrl: baseUrl + consltantPort + consultantService,
  documentServiceUrl: baseUrl + documentPort + documentService,
  activeConsultantServiceUrl: baseUrl + clientProjectPort + activeConsultantService,
  generatedTimesheetServiceUrl: baseUrl + timesheetCollectionPort + timesheetService,
  holidayServiceUrl: baseUrl + timesheetCollectionPort + holidayService,
  timesheetLabelServiceUrl: baseUrl + timesheetCollectionPort + timesheetLabelService,
  emailServiceUrl: baseUrl + timesheetCollectionPort + emailService,
  endClientServiceUrl: baseUrl + projectPort + endClientService,
  postmarkEmailServiceUrl: baseUrl + timesheetCollectionPort + postmarkEmailService,
  milestoneServiceUrl: baseUrl + clientProjectPort + milestoneService,
  importTimesheetServiceUrl: baseUrl + timesheetCollectionPort + importTimesheetService,
  commentServiceUrl: baseUrl + timesheetCollectionPort + commentService,
}
