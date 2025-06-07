export class FilterCriteria {
    firstName?: string;
    lastName?: string;
    projectName?: string[];
    clientShortName?: string[];
    abrufName?: string;
    abrufNo?: string;
    poNo?: string;
    pgName?: string;
    tsGenerationStatus?: any;
    emailGenerationStatus?: string;
    month?: number;
    year?: number;
    page?: number;
    pageSize?: number;
    importDate?: string;
    monthYear?: string;
    hours?: string;

    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.projectName = [];
        this.clientShortName = [];
        this.abrufName = '';
        this.poNo = '';
        this.pgName = '';
        this.tsGenerationStatus = '';
        this.emailGenerationStatus = '';
        this.month = 0;
        this.year = 0;
        this.page = 0;
        this.pageSize = 0;
        this.importDate = '';
        this.monthYear = '';
        this.hours = '';
    }
}
