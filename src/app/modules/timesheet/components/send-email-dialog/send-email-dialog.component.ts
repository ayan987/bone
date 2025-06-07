import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { EmailService } from '../../services/email/email.service';
import { HttpResponse } from '@angular/common/http';
import { EmailTemplate } from '../../../../models/email-template';
import { PostmarkEmailTemplate } from '../../../../models/postmark-email-template';
import {
  EmailPreviewDialogComponent,
} from '../email-preview-dialog/email-preview-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { MilestoneInPreview } from '../../../../models/milestone-preview';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailPayload } from '../../../../models/email-payload';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-send-email-dialog',
  templateUrl: './send-email-dialog.component.html',
  styleUrl: './send-email-dialog.component.scss',
})
export class SendEmailDialogComponent {
  groupedData: any[] = [];
  templates: EmailTemplate[] = [];
  isLoading = false;
  displayedColumns: string[] = ['consultant', 'email', 'projectName', 'po', 'pgName', 'monthYear', 'template'];

  constructor(
    public dialogRef: MatDialogRef<SendEmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[],
    private emailService: EmailService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private readonly _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.getEmailTemplates();
    this.groupData();
  }

  getEmailTemplates(): void {
    // this.isLoading = true;
    this.emailService.getEmailTemplates().subscribe({
      next: (response: HttpResponse<EmailTemplate[]>) => {
        if (response.status === 200) {
          this.templates = response.body || [];
        }
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error('Failed to load email templates.');
      },
    });
  }

  get allTemplatesSelected(): boolean {
    return this.groupedData.every(group => !!group.selectedTemplate);
  }  

  // openEmailPreview(group: any, entry: any): void {
  //   if (!group.selectedTemplate) {
  //     this.toastr.error('Please select a template first.');
  //     return;
  //   }
  //   const snackBarRef = this._snackBar.open('Opening preview...');
  //   const templateId = group.selectedTemplate.templateId;
  //   this.emailService.getTemplatePreview(templateId).subscribe({
  //     next: (response: HttpResponse<PostmarkEmailTemplate>) => {
  //       if (response.status === 200) {
  //         const postmarkTemplate: any = response.body || {};
  //         this.emailService.getMilestones(entry.projectId, entry.clientId, entry.abrufId).subscribe({
  //           next: (response: HttpResponse<MilestoneInPreview[]>) => {
  //             const milestones: any = response.body || [];
  //             const entryPeriod = entry.year * 12 + entry.month;

  //             const filteredMilestones = milestones.filter((m: any) => {
  //               if (!m.milestoneStartDate) {
  //                 return false;
  //               }
  //               // Parse the milestone start date in DD.MM.YYYY format
  //               const msStart = moment(m.milestoneStartDate, "DD.MM.YYYY").toDate();
  //               const msStartPeriod = msStart.getFullYear() * 12 + (msStart.getMonth() + 1);
                
  //               if (m.milestoneEndDate) {
  //                 const msEnd = moment(m.milestoneEndDate, "DD.MM.YYYY").toDate();
  //                 const msEndPeriod = msEnd.getFullYear() * 12 + (msEnd.getMonth() + 1);
  //                 return entryPeriod >= msStartPeriod && entryPeriod <= msEndPeriod;
  //               } else {
  //                 return entryPeriod >= msStartPeriod;
  //               }
  //             });
  
  //             // Join the filtered milestone names with commas and a trailing space (if any exist).
  //             // const milestonesStr =
  //             //   filteredMilestones.map((m: any) => m.milestoneName).join(', ') +
  //             //   (filteredMilestones.length > 0 ? ' ' : '');

  //             // Build a UL/LI string, no bold around it:
  //             let milestonesHtml = '';
  //             if (filteredMilestones.length) {
  //               milestonesHtml =
  //                 `<ul style="
  //                     list-style-type: disc;
  //                     padding-left: 1.5rem;
  //                     margin: 0.5rem 0;
  //                   ">` +
  //                 filteredMilestones
  //                   .map((m: any) => `<li>${m.milestoneName}</li>`)
  //                   .join('') +
  //                 `</ul>`;
  //             }
  
  //             const substitutedSubject = this.substituteTemplate(
  //               postmarkTemplate.Subject,
  //               entry,
  //               ''
  //             );
  //             // const substitutedHtmlBody = this.substituteTemplate(
  //             //   postmarkTemplate.HtmlBody,
  //             //   entry,
  //             //   milestonesHtml
  //             // );
              
  //             const rawHtml = this.substituteTemplate(
  //               postmarkTemplate.HtmlBody,
  //               entry,
  //               milestonesHtml
  //             );

  //             const safeHtml: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(rawHtml);

  //             let attachmentFileName = '';
  //             if (group.selectedTemplate.attachGenTs) {
  //               attachmentFileName = this.extractFileNameFromUrl(
  //                 entry.generatedTSPath || '');
  //             }
  
  //             const previewData: EmailPreviewData = {
  //               subject: substitutedSubject,
  //               htmlBody: safeHtml,
  //               attachmentFileName: attachmentFileName,
  //               generatedTSPath: entry.generatedTSPath,
  //               email: entry.email,
  //               cc: group.selectedTemplate.ccToSender ? entry.email : '',
  //             };
  //             snackBarRef.dismiss();
  //             this.dialog.open(EmailPreviewDialogComponent, {
  //               data: previewData,
  //               width: '800px',
  //             });
  //           },
  //           error: (err: any) => {
  //             console.error(err);
  //             snackBarRef.dismiss();
  //           },
  //         });
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error(err);
  //       snackBarRef.dismiss();
  //     },
  //   });
  // }

  openEmailPreview(group: any, entry: any): void {
    if (!group.selectedTemplate) {
      this.toastr.error('Please select a template first.');
      return;
    }
  
    const snackBarRef = this._snackBar.open('Opening preview...');
    // Step 1: Pre-fetch milestones
    this.emailService.getMilestones(entry.projectId, entry.clientId, entry.abrufId)
      .subscribe({
        next: (msResp: HttpResponse<MilestoneInPreview[]>) => {
          const allMs = msResp.body || [];
          const entryPeriod = entry.year * 12 + entry.month;
  
          // Step 2: Filter by month/year window
          const filtered = allMs.filter(m => {
            if (!m.milestoneStartDate) {
              return false;
            }
            const start = moment(m.milestoneStartDate, 'DD.MM.YYYY').toDate();
            const startPeriod = start.getFullYear() * 12 + (start.getMonth() + 1);
  
            if (m.milestoneEndDate) {
              const end = moment(m.milestoneEndDate, 'DD.MM.YYYY').toDate();
              const endPeriod = end.getFullYear() * 12 + (end.getMonth() + 1);
              return entryPeriod >= startPeriod && entryPeriod <= endPeriod;
            } else {
              // no end date → include if entryPeriod ≥ startPeriod
              return entryPeriod >= startPeriod;
            }
          });
  
          // Step 3: Determine which templateId to use
          let templateId = group.selectedTemplate.templateId;
          if (filtered.length === 0 && group.selectedTemplate.noMilestoneTemplateId) {
            templateId = group.selectedTemplate.noMilestoneTemplateId;
          }
  
          // Step 4: Fetch the chosen template
          this.emailService.getTemplatePreview(templateId).subscribe({
            next: (tplResp: HttpResponse<PostmarkEmailTemplate>) => {
              if (tplResp.status !== 200) {
                snackBarRef.dismiss();
                return;
              }
              const postmarkTemplate = tplResp.body!;
  
              // Step 5: Build HTML list (or empty)
              let milestonesHtml = '';
              if (filtered.length > 0) {
                milestonesHtml =
                  `<ul style="list-style-type:disc;padding-left:1.5rem;margin:0.5rem 0;">` +
                  filtered.map(m => `<li>${m.milestoneName}</li>`).join('') +
                  `</ul>`;
              }
  
              // Step 6: Substitute all placeholders (bold except for MILESTONES)
              const rawHtml = this.substituteTemplate(
                postmarkTemplate.HtmlBody,
                entry,
                milestonesHtml
              );
              const safeHtml: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  
              // Step 7: Build the subject
              const substitutedSubject = this.substituteTemplate(
                postmarkTemplate.Subject,
                entry,
                ''
              );
  
              // Step 8: Extract the attachment file name (if needed)
              let attachmentFileName = '';
              if (group.selectedTemplate.attachGenTs) {
                attachmentFileName = this.extractFileNameFromUrl(entry.generatedTSPath || '');
              }
  
              // Step 9: Open the preview dialog
              snackBarRef.dismiss();
              this.dialog.open(EmailPreviewDialogComponent, {
                width: '800px',
                data: {
                  subject: substitutedSubject,
                  htmlBody: safeHtml,
                  attachmentFileName,
                  generatedTSPath: entry.generatedTSPath,
                  email: entry.email,
                  clientEmail: entry.clientEmail ? entry.clientEmail : '',
                  cc: group.selectedTemplate.ccToSender ? entry.email : ''
                }
              });
            },
            error: () => snackBarRef.dismiss()
          });
        },
        error: () => snackBarRef.dismiss()
      });
  }

  private extractFileNameFromUrl(url: string): string {
    const fileParam = "file=";
    const fileIndex = url.indexOf(fileParam);
    if (fileIndex === -1) {
      return "";
    }
    const start = fileIndex + fileParam.length;
    const ampIndex = url.indexOf("&", start);
    let fileName = ampIndex === -1 ? url.substring(start) : url.substring(start, ampIndex);
    
    // Find the last underscore and the dot before the extension.
    const underscoreIndex = fileName.lastIndexOf('_');
    const dotIndex = fileName.lastIndexOf('.');
    
    // If found, remove the last segment (after the last underscore) but keep the file extension.
    if (underscoreIndex !== -1 && dotIndex !== -1 && underscoreIndex < dotIndex) {
      fileName = fileName.substring(0, underscoreIndex) + fileName.substring(dotIndex);
    }
    
    return fileName;
  }
  
  

  // substituteTemplate(template: string, entry: any, milestone: any): string {
  //   const monthName = this.getMonthName(entry.month);
  //   // For example, using poEndDate as the due date.
  //   const dueDate = entry.poEndDate;
  //   const milestones = ''; // You can provide logic to compute milestones if needed.
  //   return template
  //     .replace(/{{MONTH_NAME}}/g, monthName)
  //     .replace(/{{DUE_DATE}}/g, dueDate)
  //     .replace(/{{MILESTONES}}/g, milestones);
  // }

  substituteTemplate(template: any, entry: any, milestones: string): string {
    const bold = (text: string) => `<b>${text}</b>`;
    const monthName = this.getMonthName(entry.month);
    return template
      .replace(/{{MONTH_NAME}}/g, bold(monthName))
      .replace(/{{FIRST_NAME}}/g, bold(entry.firstName))
      .replace(/{{LAST_NAME}}/g, bold(entry.lastName))
      .replace(/{{PROJECT_NAME}}/g, bold(entry.projectName))
      .replace(/{{ABRUF}}/g, bold(entry.abrufNo))
      .replace(/{{YYYY}}/g, bold(entry.year.toString()))
      .replace(/{{MM}}/g, bold(entry.month.toString()))
      .replace(/{{DUE_DATE}}/g, bold(this.getDueDate(entry.year, entry.month)))
      .replace(/\{\{\{MILESTONES\}\}\}/g, milestones);
      // .replace(/{{MILESTONES}}/g, milestones);
  }

  getDueDate(year: number, month: number): string {
    // Create a date with the last day of the month.
    const date = new Date(year, month, 0);
    // If Saturday, subtract one day; if Sunday, subtract two days.
    if (date.getDay() === 6) {
      date.setDate(date.getDate() - 1);
    } else if (date.getDay() === 0) {
      date.setDate(date.getDate() - 2);
    }
    // Format date in dd.mm.yyyy format.
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  getMonthName(month: number): string {
    const monthNames = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];
    return monthNames[month - 1];
  }

  prepareEmailPayload(): EmailPayload[] {
    const emails: EmailPayload[] = [];
    this.groupedData.forEach(group => {
      if (!group.selectedTemplate) {
        // Skip groups with no selected template.
        return;
      }
      group.items.forEach((entry: any) => {
        emails.push({
          bucketId: entry.id,
          email: entry.email,
          clientEmail: entry.clientEmail,
          firstName: entry.firstName,
          lastName: entry.lastName,
          projectId: entry.projectId,
          projectName: entry.projectName,
          clientId: entry.clientId,
          abrufId: entry.abrufId,
          abrufNo: entry.abrufNo,
          month: entry.month,
          year: entry.year,
          templateId: group.selectedTemplate.templateId,
          generatedTSPath: entry.generatedTSPath,
          ccToSender: group.selectedTemplate.ccToSender,
          attachGenTs: group.selectedTemplate.attachGenTs,
          attachImportedTs: group.selectedTemplate.attachImportedTs,
          attachExportedPdf: group.selectedTemplate.attachExportedPdf,
          attachConvertedTs: group.selectedTemplate.attachConvertedTs
        });
      });
    });
    return emails;
  }

  sendEmail(): void {
    this.isLoading = true;
    // Build an array of minimal payloads.
    const emails: EmailPayload[] = this.prepareEmailPayload();

    // Send the minimal payload to the backend.
    this.emailService.sendEmails({emails}).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.closeDialog(true);
          this.isLoading = false;
          this.toastr.success('Email generation process started successfully.');
        }
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
        this.toastr.error('Failed to start process.');
      }
    });
  }

  groupData(): void {
    const groups: { [key: string]: any[] } = {};
    this.data.forEach((entry) => {
      const clientShortName = entry.clientShortName || 'Unknown';
      if (!groups[clientShortName]) {
        groups[clientShortName] = [];
      }
      groups[clientShortName].push(entry);
    });
    this.groupedData = Object.keys(groups).map((key) => ({
      clientShortName: key,
      items: groups[key],
      selectedTemplate: '',
      isExpanded: true,
    }));
  }

  toggleGroup(group: any): void {
    group.isExpanded = !group.isExpanded;
  }

  formatMonthYear(month: string | number, year: string | number): string {
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    const date = moment({ year: yearNumber, month: monthNumber - 1 });
    return date.format('MMM-YY');
  }

  onTemplateChange(group: any, templateValue: string): void {
    group.selectedTemplate = templateValue;
  }

  onSendEmail(): void {
    this.dialogRef.close(this.groupedData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  closeDialog(value: boolean): void {
    this.dialogRef.close(value);
  }
}
