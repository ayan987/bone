import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { Util } from '../../../../libraries/Util';
import { TimesheetStatus } from '../../../../models/timesheet-status-enum';
import { GeneratedTimesheet } from '../../../../models/generated-timesheet';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { MatDialog } from '@angular/material/dialog';
import { ActiveConsultant } from '../../../../models/timesheet-consultant';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CommentDto } from '../../../../models/comment.model';
import { TimesheetTemplateService } from '../../../shared/services/timesheet-template/timesheet-template.service';
import { PoService } from '../../../shared/services/po/po.service';
import { ProjectService } from '../../../project/services/project/project.service';
import { ActiveConsultantService } from '../../services/active-consultant/active-consultant.service';
import { ConsultantService } from '../../../shared/services/consultant/consultant.service';

export interface MasterData {
  auftraggeber: string;
  auftragnehmer: string;
  vertragsNr: string;
  projektbezeichnung: string;
  vertragsnummerBAMF: number;
  einsatzberichtMonat: string;
  rolleImProjekt: string;
  dienstort: string;
  meilenstein: number;
  totalRemoteHours: number;
  totalOnsiteHours: number;
  totalHours: number;
  checksum: string;
}

export interface MappedData {
  abrufNo: string;
  bamfContractNo: number;
  client: string;
  consultantName: string;
  contractor: number;
  milestone: string;
  projectDescription: string;
  reportMonth: string;
  roleInProject: string;
  totalOnsiteHours: any;
  totalRemoteHours: any;
  totalHours: any;
  workLocation: string;
}

export interface ImportHistoryItem {
  updatedAt: string;
  masterdata: MasterData;
  mappedData: MappedData;
  filePath: string;
  updatedStatus: string;
  file: string;
  fileNameFromConsultant: any;
  reportMonth: any;
  fileEtag: any;
  fileName: any;
  totalWarnings: any;
  automatic: boolean;
}

@Component({
  selector: 'app-view-timesheet',
  templateUrl: './view-timesheet.component.html',
  styleUrl: './view-timesheet.component.scss',
})
export class ViewTimesheetComponent implements OnInit, OnChanges, OnDestroy {
  @Input() timesheetData?: GeneratedTimesheet;
  @Output() closeNavBar = new EventEmitter<boolean>();
  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;
  assignedTimesheetLabelsObj: any;
  util = new Util();

  error = TimesheetStatus.error;
  queued = TimesheetStatus.genqueued || TimesheetStatus.emailqueued;
  started = TimesheetStatus.started;
  generated = TimesheetStatus.generated;
  notneeded = TimesheetStatus.notneeded;
  tsdeleted = TimesheetStatus.tsdeleted;
  imported = TimesheetStatus.imported;
  correctionNeeded = TimesheetStatus.correctionNeeded;
  sent = TimesheetStatus.sent;
  unmatched = TimesheetStatus.importedTimesheetUnmatched;
  importedTimesheetMatched = TimesheetStatus.importedTimesheetMatched;

  importTimesheetData: any = [];
  importTimesheetHistory: ImportHistoryItem[] = [];
  totalImportHistoryCount: number = 0;
  profilePicUrl: string | undefined;
  showCommentBox: boolean = false;
  showNewCommentBox: boolean = false;
  editingCommentId!: string;
  editingIndex: number | null = null;
  private userNameSub: Subscription | undefined;
  userName: string | null = null;
  profilePicUrl$ = this.authService.profilePicUrl$;
  userLoggedInEmail!: string;
  commentData: CommentDto = {
    id: '',
    createdAt: '',
    timesheetId: '',
    userName: '',
    userEmail: '',
    comment: '',
    status: '',
    updatedAt: '',
    timestamp: '',
    userProfilePicUrl: '',
  };
  comments: CommentDto[] = [];
  isViewAllComments: boolean = false;
  poTimesheetTemplateHeaderData!:any;

  constructor(
    private readonly timesheetService: TimesheetService,
    private readonly toastr: ToastrService,
    private readonly _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private readonly authService: AuthService,
    private readonly timesheetTemplateService: TimesheetTemplateService,
    private readonly poService: PoService,
    private readonly ProjectService: ProjectService,
    private consultantService: ConsultantService,
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      this.resetPanelStates();
    });
    this.importTimesheetData = [];
    this.importTimesheetHistory = [];

    if (changes['timesheetData'] && this.timesheetData) {
      this.assignedTimesheetLabelsObj = {
        labels: this.timesheetData?.labels?.labels,
        timesheetId: this.timesheetData?.id,
      };
      Object.assign(this.timesheetData, {
        endDateMonthYear: Util.dateMonthYearString(
          this.timesheetData?.month,
          this.timesheetData?.year
        ),
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up the subscription
    this.userNameSub?.unsubscribe();
  }

  /** Download the imported timesheet */
  downloadImportedTimesheet(eTag: string, excelFileName: string): void{
    if (eTag && excelFileName) {
      const snackBarRef = this._snackBar.open('Downloading...');
      const fileId = Util.extractUUID(eTag);
      const fileName = excelFileName;
      const requestObj = {
        fileId: fileId,
        fileName: fileName,
        token: localStorage.getItem('token')?.slice(1, -1),
      };
      this.timesheetService.downloadGeneratedTimesheet(requestObj).subscribe({
        next: (response: any) => {
          const blob = response.body;
          if (blob && blob.size !== 0) {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', fileName);
            link.click();
            snackBarRef.dismiss();
          } else {
            snackBarRef.dismiss();
            this.toastr.error('File does not exist', '', {
              timeOut: 5000,
              closeButton: true,
            });
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      this.toastr.error('File does not exist', '', {
        timeOut: 5000,
        closeButton: true,
      });
    }
  }

  /** Get the data of the import timsheet */
  getImportTimesheetData(checksum: string | undefined): any {
    console.log(checksum)
    // if(this.timesheetData?.statuses?.statusKey === this.imported){
      this.timesheetService.getImportTimesheetData(checksum).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            const timehseetObj = this.showImportHistoryStatus(
              response.body ?? []
            );
            this.importTimesheetData = timehseetObj.timesheetData;
            this.importTimesheetHistory = timehseetObj.timehseetHistory;
            this.totalImportHistoryCount = this.importTimesheetHistory.length; //Count the number of items present
          }
        },
        error: (err) => {
          console.error(err);
          console.log("No timesheet to view");
        },
      });
    // } else {
    //   console.log("Import a timesheet first");
    // }

    this.onPanelOpened(3);
  }
  /** Get the status of the import history */
  showImportHistoryStatus(importData: any) {
    let importTimesheetHistory = [...(importData.importHistory ?? [])]
      .reverse() //Reverse the history data for latest on top
    let importTimesheetData = importData;

    // 1) Build a lookup from statusDatetime -> status
    const statusMap: Record<string, string> = {};
    importTimesheetData.statusHistory.forEach((historyItem: any) => {
      statusMap[historyItem.statusDatetime] = historyItem.status;
    });

    // 2) For each item in importTimesheetHistory, look up updatedStatus from statusMap
    importTimesheetHistory = importTimesheetHistory.map((histItem: any) => {
      const matchingStatus = statusMap[histItem.updatedAt] || 'Unknown';
      // Return a new object with all original properties plus updatedStatus for the history of the imported timesheet
      return {
        ...histItem,
        updatedStatus: matchingStatus,
      };
    });
    return {
      timesheetData: importTimesheetData,
      timehseetHistory: importTimesheetHistory,
    };
  }
  /** Trigger the on navbar on close */
  closeSideBar(loadData: boolean): void {
    this.closeNavBar.emit(loadData);
    this.resetPanelStates();
  }

  get isDeletable(): boolean {
    return this.timesheetData?.statuses?.statusKey === this.generated;
  }

  get isDownloadable(): boolean {
    return this.timesheetData?.statuses?.statusKey === this.generated ||
    this.timesheetData?.statuses?.statusKey === this.imported ||
    this.timesheetData?.statuses?.statusKey === this.sent;
  }

  get isRegeneration(): boolean {
    const status = this.timesheetData?.statuses?.statusKey as TimesheetStatus;
    if (!status) {
      return false;
    }
    return [this.generated, this.tsdeleted, this.error, this.sent, this.unmatched].includes(status);
  }

  cancelManualMatch(timesheetData: any, importTimesheetData: any): void {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'delete-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.unmatchTimesheet, Messages.unmatchTimesheetTitle],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const timesheetStatusHistoryArray = timesheetData.statuses.statusHistory;
        const targetDateTime = timesheetData.statuses.datetime;
        const targetStatusKey = timesheetData.statuses.statusKey;
        const targetStatusGoodName = timesheetData.statuses.statusGoodName;

        const remainingHistory = timesheetStatusHistoryArray.filter((status: any) =>
          !(
            status.datetime === targetDateTime &&
            status.statusKey === targetStatusKey &&
            status.statusGoodName === targetStatusGoodName
          )
        );

        const requestPayload = {
          id: remainingHistory[0].id,
          statusKey: remainingHistory[0]?.statusKey,
          statusGoodName: remainingHistory[0]?.statusGoodName,
          datetime: remainingHistory[0]?.datetime,
          reason: remainingHistory[0]?.reason,
          statusHistory: remainingHistory
        };
        this.timesheetService.updateGeneratedTimesheetStatus(timesheetData.id, requestPayload).subscribe({
          next: (response: any) => {
            if (response.status === 204) {
              this.timesheetService.updateImportedTimesheetStatus(importTimesheetData.id, this.unmatched).subscribe({
                next: (response: any) => {
                  if (response.status === 204) {
                    console.log('Updated Imported timesheet status to unmatched');
                  }
                }, error: (err) => {console.log(err)}});
              this.toastr.success('Manual match cancelled successfully');
              this.closeSideBar(true);
            } else {
              this.toastr.error('Failed to cancel manual match');
            }
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    });
  }

  /** Download the generated timesheet */
  downloadGeneratedTimesheet(timesheetUrl: string | undefined): void {
    if (timesheetUrl) {
      const snackBarRef = this._snackBar.open('Downloading...');
      const fileId = Util.getFileId(timesheetUrl);
      const fileName = Util.getFileName(timesheetUrl);
      const requestObj = {
        fileId: fileId,
        fileName: fileName,
        token: localStorage.getItem('token')?.slice(1, -1),
      };
      this.timesheetService.downloadGeneratedTimesheet(requestObj).subscribe({
        next: (response: any) => {
          const blob = response.body;
          if (blob && blob.size !== 0) {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', fileName);
            link.click();
            snackBarRef.dismiss();
          } else {
            snackBarRef.dismiss();
            this.toastr.error('File does not exist', '', {
              timeOut: 5000,
              closeButton: true,
            });
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      this.toastr.error('File does not exist', '', {
        timeOut: 5000,
        closeButton: true,
      });
    }
  }

  /**Delete of the generated timesheet */
  deleteGeneratedTimesheet(
    timesheetUrl: string | undefined,
    timesheetId: string | undefined
  ): void {
    if (timesheetUrl && timesheetId) {
      const fileId = Util.getFileId(timesheetUrl);
      const requestObj = {
        fileId: fileId,
        timesheetId: timesheetId,
        token: localStorage.getItem('token')?.slice(1, -1),
      };
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'delete-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.deleteTimesheet, Messages.deleteTimesheetTitle],
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.timesheetService
            .deleteOfGeneratedTimesheet(requestObj)
            .subscribe({
              next: (response: any) => {
                if (response.status === 200) {
                  this.toastr.success('Timesheet deleted successfully');
                  this.closeSideBar(true);
                }
              },
              error: (err) => {
                console.error(err);
              },
            });
        }
      });
    }
  }

  /** Regenerate the timesheet */
  regenerateTimesheet(consultantData?: GeneratedTimesheet): void {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'edit-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.confirmRegeneration, 'Confirmation'],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && consultantData) {
        this.startRegenerationOfTimesheets(consultantData);
      }
    });
  }

  // getAllActiveConsultants(filter: FilterCriteria): void {
  //       // this.isLoading = true;
  //       this.activeConsultantService.getAllActiveConsultants(filter).subscribe({
  //         next: (response: HttpResponse<ActiveConsultant[]>) => {
  //           if (response.status === 200) {
  //             this.dataSource = response.body || [];
  //             this.dataSource = this.dataSource.filter((timesheet: ActiveConsultant) => timesheet.poNo !== null);
  //             // this.isLoading = false;
  //           }
  //         },
  //         error: (err: any) => {
  //           console.log(err);
  //           // this.isLoading = false;
  //         },
  //       });
  // }

  startRegenerationOfTimesheets(consultantData: GeneratedTimesheet): void {
    const requestPayload = {
      activeConsultants: [
        this.destructureDataWithActiveConsultant(consultantData),
      ],
      month: consultantData.month,
      year: consultantData.year,
    };

    let consultantdata = requestPayload.activeConsultants[0];

    if(consultantdata.poId) {
      this.poService.getPoDetailsById(consultantdata.poId).subscribe({
        next: (poResponse: any) => {
          if(poResponse.status === 200) {
            let poData = poResponse.body;
            consultantdata.vcId = poData.vcId;
            consultantdata.poTimesheetTemplateId = poData.poTimesheetTemplate.templateId;
            if(consultantdata.poTimesheetTemplateId) {
              this.timesheetTemplateService.getTemplateById(consultantdata.poTimesheetTemplateId).subscribe({
                next: (timesheetResponse: any) => {
                  if (timesheetResponse.status === 200) {
                    let poTimesheetTemplateData = timesheetResponse.body;

                    consultantdata.poTimesheetTemplateHeaderData = poTimesheetTemplateData.timesheetHeaderData;
                    consultantdata.poTimesheetTemplateFileName  = poTimesheetTemplateData.filename;
                    consultantdata.poTimesheetTemplateName  = poTimesheetTemplateData.templateName;

                    if(consultantdata.projectId){
                      this.ProjectService.getProjectById(consultantdata.projectId).subscribe({
                        next: (projectResponse: any) => {
                          if (projectResponse.status === 200) {
                            let endClientData = projectResponse.body;

                            consultantdata.endClientName = endClientData.endClients.name;
                            consultantdata.resPersonId = endClientData.responsiblePerson.id;
                            consultantdata.resPersonName = endClientData.responsiblePerson.firstName + ' ' + endClientData.responsiblePerson.lastName;

                            if (consultantData.pgConsultantId) {
                              this.consultantService.getConsultantById(consultantData.pgConsultantId).subscribe({
                                next: (consultantResponse: any) => {
                                  if (consultantResponse.status === 200) {
                                    let consultantDataFromResponse = consultantResponse.body;
                                    consultantdata.firstName = consultantDataFromResponse.firstName;
                                    consultantdata.lastName = consultantDataFromResponse.lastName;
                                    consultantdata.email = consultantDataFromResponse.email;
                                    consultantdata.clientEmail = consultantDataFromResponse.clientEmail;
                                    this.timesheetRegenerationFinalCall(requestPayload);
                                  }
                                },
                                error: (err: any) => {
                                  console.error(err);
                                },
                              });
                            } else {
                              this.toastr.error('Pg Consultant Id is empty');
                            }
                          }
                        },
                        error: (err: any) => {
                          console.error(err);
                        },
                      })
                    } else {
                      this.toastr.error('Project Id is empty');
                    }
                  }
                },
                error: (err: any) => {
                  console.error(err);
                },
              });
            } else {
              this.toastr.error('Po Timesheet Template Id is empty');
            }
          }
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    } else {
      this.toastr.error('Po Id is empty');
    }
  }

  timesheetRegenerationFinalCall(requestPayload: any): void{
    this.timesheetService.generateTimesheets(requestPayload, true).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          console.log('Timesheets generation started successfully');
          this.closeSideBar(true);
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  destructureDataWithActiveConsultant(
    data: GeneratedTimesheet
  ): ActiveConsultant {
    const {
      timesheetGeneratedBy,
      timesheetGeneratedTimestamp,
      month,
      year,
      generationStatus,
      generatedTSPath,
      labels,
      endDateMonthYear,
      ...filteredData
    } = data;
    return filteredData;
  }
  /** Helper function to reset the accordions */
  private resetPanelStates(): void {
    const panelArray = this.panels.toArray();
    const key = this.timesheetData?.statuses?.statusKey;
    panelArray.forEach(panel => panel.expanded = false);

    panelArray[0]!.expanded = true; //always close the first panel

    if (key === this.generated || key === this.tsdeleted || key === this.sent) {
      panelArray[1].expanded = true;
    }
    else if (key === this.imported) {
      panelArray[2].expanded = true;
    }
  }

  /** Comments Module for the timesheet */
  getDataForComments(): void {
    this.userNameSub = this.authService.userName$.subscribe((userData: any) => {
      this.userName = userData?.name;
      this.userLoggedInEmail = userData?.email;
    });
    this.getComments();
    this.isViewAllComments = false;
    this.onPanelOpened(5);
  }

  prepareCommentData(commentDataExisting?: CommentDto): any {
    if (commentDataExisting) {
      return { ...commentDataExisting };
    }
    Object.assign(this.commentData, {
      timesheetId: this.timesheetData?.id,
      userName: this.userName,
      userEmail: this.userLoggedInEmail,
    });
    return this.commentData;
  }

  getComments(): void {
    this.timesheetService
      .getCommentByTimesheetId(this.timesheetData?.id)
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            let commentData = response.body;
            commentData.forEach((comment: CommentDto) => {
              this.authService
                .getAllProfilePicture(comment.userEmail)
                .subscribe({
                  next: (data: any) => {
                    const blobUrl = URL.createObjectURL(data);
                    comment.userProfilePicUrl = blobUrl;
                  },
                  error: (err: any) => {
                    console.log(err);
                  },
                });
              console.log(comment.userProfilePicUrl);
            });
            this.comments = commentData;
            console.log(this.comments);
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  deleteComment(commentId: string): void {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'delete-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.deleteComment, Messages.deleteCommentTitle],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.timesheetService.deleteCommentByCommentId(commentId).subscribe({
          next: (response: any) => {
            if (response.status === 200) {
              this.toastr.success('Comment deleted successfully');
              this.getComments();
            }
          },
          error: (err) => {
            console.error(err);
          },
        });
      }
    });
  }

  viewAllComents(): void {
    this.isViewAllComments = !this.isViewAllComments;
  }

  onEdit(comment: any, index: number): void {
    if (this.editingIndex === null) {
      this.editingIndex = index;
      this.editingCommentId = comment.id;
    } else {
      this._snackBar.open('You have unsaved chnages save it first', '', {
        duration: 3000,
      });
    }
  }

  onCloseEdit() {
    this.editingCommentId = '';
    this.getComments();
    this.editingIndex = null;
  }

  onCloseNew() {
    this.showNewCommentBox = false;
    this.getComments();
  }

  onPanelOpened(index: any) {
    setTimeout(() => {
      const element = document.getElementById('matPanel'+ index);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 190);
  }
  /** Comments Module ends for the timesheet */
}
