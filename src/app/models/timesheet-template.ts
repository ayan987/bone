export interface TimesheetTemplate {
    id?: string;
    templateName: string;
    timesheetHeaderData: Map<string, string>;
    status?: string;
    filename?: string;
    url?: string;
}