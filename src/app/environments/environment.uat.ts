// const baseUrl = 'https://utho.bosenet.com:';
// const clientPort = '52036/bos1';
// const projectPort = '52037/bos1';
// const clientProjectPort = '52034/bos1';
// const timesheetCollectionPort = '52032/bos1';
// const consltantPort = '52035/bos1';
// const documentPort = '52033/bos1';
const baseUrl = 'https://utho.bosenet.com';
const clientPort = '/bos1/uat/clients';
const projectPort = '/bos1/uat/projects';
const clientProjectPort = '/bos1/uat/core';
const timesheetCollectionPort = '/bos1/uat/ts';
const consltantPort = '/bos1/uat/consultants';
const documentPort = '/bos1/uat/documents';
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
const endClientService = '/bosenetone/service/v1/endclients';
const milestoneService = '/bosenetone/service/v1/milestones';
const emailService = '/bosenetone/service/v1/email';
const postmarkEmailService = '/bosenetone/service/v1/postmark';
const importTimesheetService = '/bosenetone/service/v1/importTimesheet';
const commentService = '/bosenetone/service/v1/comments';

export const environment = {
    redirectUri: 'https://bosenetoneuat.web.app/',
    // redirectUri: 'http://localhost:4200/',
    msGraphApiUrl: 'https://graph.microsoft.com/v1.0/',
    msClientId: '79434a65-8027-4a9e-9ced-3af183c70a32',
    firebase: {
        apiKey: "AIzaSyCQpEhGkslsnCwOl3kemFwwWscjF5qv6No",
        authDomain: "bosenetoneqa.firebaseapp.com",
        projectId: "bosenetoneqa",
        storageBucket: "bosenetoneqa.firebasestorage.app",
        messagingSenderId: "69636022049",
        appId: "1:69636022049:web:7a5900f9a60f937912e860"
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
    endClientServiceUrl: baseUrl + projectPort + endClientService,
    milestoneServiceUrl: baseUrl + clientProjectPort + milestoneService,
    emailServiceUrl: baseUrl + timesheetCollectionPort + emailService,
    postmarkEmailServiceUrl: baseUrl + timesheetCollectionPort + postmarkEmailService,
    importTimesheetServiceUrl: baseUrl + timesheetCollectionPort + importTimesheetService,
    commentServiceUrl: baseUrl + timesheetCollectionPort + commentService,
}
