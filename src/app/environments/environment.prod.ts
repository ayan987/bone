// const baseUrl = 'https://utho.bosenet.com:';
// const clientPort = '52036/bos1';
// const projectPort = '52037/bos1';
// const clientProjectPort = '52034/bos1';
// const timesheetCollectionPort = '52032/bos1';
// const consltantPort = '52035/bos1';
// const documentPort = '52033/bos1';
const baseUrl = 'https://utho.bosenet.com';
const clientPort = '/bos1/prod/clients';
const projectPort = '/bos1/prod/projects';
const clientProjectPort = '/bos1/prod/core';
const timesheetCollectionPort = '/bos1/prod/ts';
const consltantPort = '/bos1/prod/consultants';
const documentPort = '/bos1/prod/documents';
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
    production: true,
    redirectUri: 'https://one.bosenet.com/',
    msGraphApiUrl: 'https://graph.microsoft.com/v1.0/',
    msClientId: '7646652a-ac89-4b7b-8ef4-32d7c7f6001b',
    firebase: {
        apiKey: "AIzaSyDBrq_1aOBxc5LnJCEBU49aDL1R98qegXk",
        authDomain: "bosenetonelive.firebaseapp.com",
        projectId: "bosenetonelive",
        storageBucket: "bosenetonelive.firebasestorage.app",
        messagingSenderId: "629483236153",
        appId: "1:629483236153:web:ebda75948966acd6ef56e8",
        measurementId: "G-QLBHSXBEGF"
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
