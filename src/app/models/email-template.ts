export interface EmailTemplate {
    id?: String;
    templateId?: String;
    name?: String;
    placeholders?: Array<String>;
    status?: String;
    ccToSender?: boolean;
    attachGenTs?: boolean;
    attachImportedTs?: boolean;
    attachExportedPdf?: boolean;
    attachConvertedTs?: boolean;
    noMilestoneTemplateId?: String;
}