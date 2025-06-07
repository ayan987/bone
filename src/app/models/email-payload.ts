export interface EmailPayload {
  bucketId?: string;
  email?: string;
  clientEmail?: string;
  firstName?: string;
  lastName?: string;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  abrufId?: string;
  abrufNo?: string;
  month?: number;
  year?: number;
  templateId?: string;
  generatedTSPath?: string;
  ccToSender?: boolean;
  attachGenTs?: boolean;
  attachImportedTs?: boolean;
  attachExportedPdf?: boolean;
  attachConvertedTs?: boolean;
}
