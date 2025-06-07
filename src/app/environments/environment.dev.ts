const localUrl = 'http://localhost:';
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
  // redirectUri: 'https://bosenetonedev.web.app/',
  redirectUri: 'http://localhost:4200/',
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
    clientProjectServiceUrl: localUrl + '8082/bos1/dev/core' + assignClientService,
    abrufServiceUrl: baseUrl + clientProjectPort + abrufService,
    poServiceUrl: localUrl + '8082/bos1/dev/core' + poService,
    timesheetServiceUrl: baseUrl + clientProjectPort + timesheetService,
    projectOverviewServiceUrl: localUrl + '8082/bos1/dev/core' + projectOverviewService,
    assignedClientProjectServiceUrl: localUrl + '8082/bos1/dev/core' + assignedClientProjectService,
    abrufEditServiceUrl: baseUrl + clientProjectPort + abrufEditService,
    deleteAbrufServiceUrl: baseUrl + clientProjectPort + deleteAbrufService,
    consultantServiceUrl: baseUrl + consltantPort + consultantService,
    documentServiceUrl: baseUrl + documentPort + documentService,
    activeConsultantServiceUrl: localUrl + '8082/bos1/dev/core' + activeConsultantService,
    generatedTimesheetServiceUrl: localUrl + '8083/bos1/dev/ts' + timesheetService,
    holidayServiceUrl: baseUrl + timesheetCollectionPort + holidayService,
    timesheetLabelServiceUrl: baseUrl + timesheetCollectionPort + timesheetLabelService,
    emailServiceUrl: localUrl + '8083/bos1/dev/ts' + emailService,
    endClientServiceUrl: baseUrl + projectPort + endClientService,
    postmarkEmailServiceUrl: localUrl + '8083/bos1/dev/ts' + postmarkEmailService,
    milestoneServiceUrl: localUrl + '8082/bos1/dev/core' + milestoneService,
    importTimesheetServiceUrl: baseUrl + timesheetCollectionPort + importTimesheetService,
    commentServiceUrl: baseUrl + timesheetCollectionPort + commentService,
}
