import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AssignConsultantComponent } from '../assign-consultant/assign-consultant.component';
import moment from 'moment';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Util } from '../../../../libraries/Util';
import { TableColumnData } from '../../models/tableColumnData';
import { AddTimesheetEntryComponent } from '../add-timesheet-entry/add-timesheet-entry.component';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';
import { Messages } from '../../../../models/message-enum';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Modules } from '../../../../models/modules-enum';
import { PoService } from '../../../shared/services/po/po.service';
import { Timesheetobj } from '../../../../models/timesheet-obj';
import { ObjPoPgConsultant } from '../../../../models/po-pg-consultant-obj';
import { ColumnData } from '../../../../models/timesheetColumnData';
import { ProjectStatus } from '../../../../models/project-status.enum';
import { ModalMessage } from '../../../../models/modal-messages';

@Component({
  selector: 'app-timesheet-consultant',
  templateUrl: './timesheet-consultant.component.html',
  styleUrl: './timesheet-consultant.component.scss'
})
export class TimesheetConsultantComponent {
  @Input() po!: any;
  @Input() pg!: any;
  @Output() consultantCount = new EventEmitter<any>();
  @Output() remainingBudget = new EventEmitter<any>();
  displayedColumns: string[] = ['action', 'name', 'startDate', 'endDate', 'previous', 'column1', 'column2', 'column3', 'column4', 'next'];
  dynamicColumns: string[] = [];
  dataSource: TableColumnData[] = [];
  isLoading!: boolean;
  startDate!: moment.Moment;
  endDate!: moment.Moment;
  currentMonth!: moment.Moment;
  startingMonth!: moment.Moment;
  monthsGenerated = 0;
  consultants: any[] = [];
  consultantIds: string[] = [];
  columns: string[] = [];
  changeFormatToLocal = Util.convertNumberToLocalFormat;

  constructor(
    public dialog: MatDialog,
    public toastr: ToastrService,
    private timesheetService: TimesheetService,
    private poService: PoService
  ) {}

  ngOnInit(): void {
    this.startDate = moment(this.po.poStartDate, 'DD.MM.YYYY');
    this.endDate = moment(this.po.poEndDate, 'DD.MM.YYYY');
    this.currentMonth = this.startDate.clone();
    this.getConsultantsByPOAndPgId();
  }

  populateTableWithData(data: any[]): void {
    this.columns = this.generateInitialColumns(this.startDate, this.endDate);

    const generatedData = data.map(item => {
      const columns: any = {
        column1: this.columns[0] ? { header: this.columns[0], onsiteHrs: 0, remoteHrs: 0, totalHrs: 0 } : null,
        column2: this.columns[1] ? { header: this.columns[1], onsiteHrs: 0, remoteHrs: 0, totalHrs: 0 } : null,
        column3: this.columns[2] ? { header: this.columns[2], onsiteHrs: 0, remoteHrs: 0, totalHrs: 0 } : null,
        column4: this.columns[3] ? { header: this.columns[3], onsiteHrs: 0, remoteHrs: 0, totalHrs: 0 } : null,
      };

      const filteredColumns: any = Object.keys(columns)
      .filter(key => columns[key as keyof typeof columns] !== null)
      .reduce((acc, key) => {
        acc[key as 'column1' | 'column2' | 'column3' | 'column4'] = columns[key as keyof typeof columns];
        return acc;
      }, {} as {
        column1?: { header: string; onsiteHrs: number; remoteHrs: number; totalHrs: number };
        column2?: { header: string; onsiteHrs: number; remoteHrs: number; totalHrs: number };
        column3?: { header: string; onsiteHrs: number; remoteHrs: number; totalHrs: number };
        column4?: { header: string; onsiteHrs: number; remoteHrs: number; totalHrs: number };
      });

      return {
        name: `${item.firstName} ${item.lastName}`,
        startDate: item.startDate,
        endDate: item.endDate,
        assignmentId: item.assignmentId,
        consultantId: item.id,
        email: item.email,
        columns: filteredColumns,
      };
    });

    this.dataSource = [...this.dataSource, ...generatedData];

    // Update the displayed columns based on the filtered columns
    this.updateDisplayedColumns();

    // Fetch data column-wise
    this.fetchConsultantDataForColumns(this.columns);
  }

  updateDisplayedColumns(): void {
    // Start with the static columns
    const staticColumns: any = ['name', 'startDate', 'endDate'];

    // Dynamically include only the non-empty columns
    const dynamicColumns: any = this.columns
      .map((col, index) => col ? `column${index + 1}` : null)
      .filter(col => col !== null); // Filter out any null columns

    // Add the 'next' column at the end
    if (dynamicColumns.length < 4) {
      this.displayedColumns = ['action', 'name', 'startDate', 'endDate', ...dynamicColumns];
    } else {
      this.displayedColumns = ['action', 'name', 'startDate', 'endDate', 'previous', ...dynamicColumns, 'next'];
    }
  }


  // populateTableWithData(data: any[]): void {
  //   this.columns = this.generateInitialColumns(this.startDate, this.endDate);
  //   const generatedData = data.map(item => {
  //     return {
  //       name: `${item.firstName} ${item.lastName}`,
  //       startDate: item.startDate,
  //       endDate: item.endDate,
  //       assignmentId: item.assignmentId,
  //       columns: {
  //         column1: { header: this.columns[0], onsiteHrs: 0, remoteHrs: 0, totalHrs: 0 },
  //         column2: { header: this.columns[1], onsiteHrs: 0, remoteHrs: 0, totalHrs: 0 },
  //         column3: { header: this.columns[2], onsiteHrs: 0, remoteHrs: 0, totalHrs: 0 },
  //         column4: { header: this.columns[3], onsiteHrs: 0, remoteHrs: 0, totalHrs: 0},
  //       }
  //     };
  //   });

  //   this.dataSource = [...this.dataSource, ...generatedData];
  //   // Fetch data column-wise.
  //   this.fetchConsultantDataForColumns(this.columns);
  // }

  fetchConsultantDataForColumns(columns: any[]): void {
    columns.forEach((monthYear, index) => {
      if (monthYear) {
        const [month, year] = monthYear.split(' ');
        const monthNumber = moment().month(month).format('M'); // Convert month name to month number.

        this.getConsultantsByPOIdPgIdMonthAndYear(parseInt(monthNumber), parseInt(year), index);
      }
    });
  }

  calculateTotalOnsiteHoursColumn4(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column4.onsiteHrs, 0);
  }

  calculateTotalRemoteHoursColumn4(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column4.remoteHrs, 0);
  }

  calculateTotalHoursColumn4(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column4.totalHrs, 0);
  }

  calculateTotalOnsiteHoursColumn3(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column3.onsiteHrs, 0);
  }

  calculateTotalRemoteHoursColumn3(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column3.remoteHrs, 0);
  }

  calculateTotalHoursColumn3(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column3.totalHrs, 0);
  }

  calculateTotalOnsiteHoursColumn2(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column2.onsiteHrs, 0);
  }

  calculateTotalRemoteHoursColumn2(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column2.remoteHrs, 0);
  }

  calculateTotalHoursColumn2(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column2.totalHrs, 0);
  }

  calculateTotalOnsiteHoursColumn1(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column1.onsiteHrs, 0);
  }

  calculateTotalRemoteHoursColumn1(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column1.remoteHrs, 0);
  }

  calculateTotalHoursColumn1(): number {
    return this.dataSource.reduce((acc, curr) => acc + curr.columns.column1.totalHrs, 0);
  }

  generateInitialColumns(startDate: moment.Moment, endDate: moment.Moment): string[] {
    const columns = [];
    let currentMonth = startDate.clone();

    for (let i = 0; i < 4; i++) {
      if (currentMonth.isSameOrBefore(endDate, 'month')) {
        columns.push(currentMonth.format('MMMM YYYY'));
        currentMonth.add(1, 'month');
      } else {
        columns.push(''); // Or handle this case differently if needed
      }
    }

    return columns;
  }

  getNextMonthHours(): void {
    this.columns[0] = this.columns[1];
    this.columns[1] = this.columns[2];
    this.columns[2] = this.columns[3];
    const newHeader = moment(this.columns[3], 'MMMM YYYY').add(1, 'month').format('MMMM YYYY');
    this.columns[3] = newHeader;
    const [month, year] = this.columns[3].split(' ');
    const monthNumber = moment().month(month).format('M');

    this.getConsultantsByPOIdPgIdMonthAndYear(parseInt(monthNumber), parseInt(year), 3);
  }

  getPreviousMonthHours(): void {
    this.columns[3] = this.columns[2];
    this.columns[2] = this.columns[1];
    this.columns[1] = this.columns[0];
    const newHeader = moment(this.columns[0], 'MMMM YYYY').subtract(1, 'month').format('MMMM YYYY');
    this.columns[0] = newHeader;
    const [month, year] = this.columns[0].split(' ');
    const monthNumber = moment().month(month).format('M');

    this.getConsultantsByPOIdPgIdMonthAndYear(parseInt(monthNumber), parseInt(year), 0);
  }

  shiftColumns(direction: 'next' | 'previous'): void {
    this.isLoading = true;
    this.dataSource.forEach(row => {
      if (direction === 'next') {
        // Shift columns
        row.columns.column1 = row.columns.column2;
        row.columns.column2 = row.columns.column3;
        row.columns.column3 = row.columns.column4;
        row.columns.column4 = {
          onsiteHrs: 0,
          remoteHrs: 0,
          totalHrs: 0,
          id: '',
          header: this.columns[3]
        }
      } else if (direction === 'previous') {
        // Shift columns
        row.columns.column4 = row.columns.column3;
        row.columns.column3 = row.columns.column2;
        row.columns.column2 = row.columns.column1;
        row.columns.column1 = {
          onsiteHrs: 0,
          remoteHrs: 0,
          totalHrs: 0,
          id: '',
          header: this.columns[0]
        }
      }
    });
    if (direction === 'next') {
      this.getNextMonthHours();
    } else if (direction === 'previous') {
      this.getPreviousMonthHours();
    }
  }

  getConsultantsByPOAndPgId(): void {
    this.timesheetService.getConsultantsByPOAndPgId(this.po._id, this.pg.id).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.consultants = response.body;
          this.consultantIds = this.consultants.map(consultant => consultant.id);
          this.populateTableWithData(this.consultants);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
      },
    });
  }

  getConsultantsByPOIdPgIdMonthAndYear(month: number, year: number, columnIndex: number): void {
    this.isLoading = true;
    this.timesheetService.getConsultantsByPOIdPgIdMonthAndYear(this.po._id, this.pg.id, month, year).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          const consultantData = response.body;
          this.populateConsultantHours(consultantData, columnIndex);
          this.isLoading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
        this.isLoading = false;
      },
    });
  }

  // Populate data for each consultant based on the assignmentId.
  populateConsultantHours(consultantData: any[], columnIndex: number): void {
    consultantData.forEach((entry: any) => {
      const consultant = this.dataSource.find(c => c.assignmentId === entry.assignmentId);
      if (consultant) {
        if (columnIndex + 1 === 1) {
          consultant.columns.column1 = {
            onsiteHrs: entry.onsiteHrs,
            remoteHrs: entry.remoteHrs,
            totalHrs: entry.totalHrs,
            id: entry.id,
            header: this.columns[0]
          };
        } else if (columnIndex + 1 === 2) {
          consultant.columns.column2 = {
            onsiteHrs: entry.onsiteHrs,
            remoteHrs: entry.remoteHrs,
            totalHrs: entry.totalHrs,
            id: entry.id,
            header: this.columns[1]
          };
        } else if (columnIndex + 1 === 3) {
          consultant.columns.column3 = {
            onsiteHrs: entry.onsiteHrs,
            remoteHrs: entry.remoteHrs,
            totalHrs: entry.totalHrs,
            id: entry.id,
            header: this.columns[2]
          };
        } else if (columnIndex + 1 === 4) {
          consultant.columns.column4 = {
            onsiteHrs: entry.onsiteHrs,
            remoteHrs: entry.remoteHrs,
            totalHrs: entry.totalHrs,
            id: entry.id,
            header: this.columns[3]
          };
        }
      }
    });
  }

  isPreviousDisabled(): boolean {
    if (this.columns[0] === '') {
      return true;
    }
    return moment(this.columns[0], 'MMMM YYYY').isSameOrBefore(this.startDate, 'month');
  }

  isNextDisabled(): boolean {
    if (this.columns[3] === '') {
      return true;
    }
    return moment(this.columns[3], 'MMMM YYYY').isSameOrAfter(this.endDate, 'month');
  }

  /** Assign consultant to PG*/

  assignConsultantToPG(): void {
    let objectPoPg: ObjPoPgConsultant = {
      poNo: this.po?.poNo,
      poId: this.po?._id,
      poStartDate: this.po?.poStartDate,
      poEndDate: this.po?.poEndDate,
      pgId: this.pg?.id,
      pgName: this.pg?.pgName,
      consultantId: '',
      consultantName: '',
      consulantStartDate: '',
      consulantEndDate: '',
      flag: false,
      assignmentId: '',
      poTimesheetTemplate: this.po?.poTimesheetTemplate,
    };

    let dialogRef = this.dialog.open(AssignConsultantComponent, {
      panelClass: 'edit-modal',
      width: '1000px',
      height: !(objectPoPg?.poTimesheetTemplate?.templateName && objectPoPg?.poTimesheetTemplate?.timesheetHeaderData) ? '690px' : '655px',
      disableClose: true,
      data: objectPoPg
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.dataSource = [];
        this.getConsultantsByPOAndPgId();
        this.consultantCount.emit();
      }
    });
  }

  /** Timesheet Entry for each consultant */
  addTimeSheetEntry(consultantList: any, month: any, columnIndex: number): void {
    if (this.po?.projects[0]?.status === ProjectStatus.active){
      this.handleTimesheetEntry(consultantList, month, columnIndex);
    } else {
      let msg_01 = 'The Project status is in ';
      let msg_02 = this.po?.projects[0]?.status;
      let msg_03 = ' timesheet entries are not possible';
      let msg = `${msg_01}${msg_02}${msg_03}`
      this.dialog.open(DeleteModalComponent, {
        panelClass: 'edit-modal',
        width: '590px',
        height: '270px',
        disableClose: true,
        data: Util.showModalMessages(Modules.Timesheet, this.po?.projects[0].projectName, msg)
      });
    }
  }

  handleTimesheetEntry(consultantList: any, month: any, columnIndex: number): void {
    let TimesheetObj: Timesheetobj = {
      consultantList: consultantList,
      poId: this.po?._id,
      pgId: this.pg?.id,
      pgName: this.pg?.pgName,
      abrufId: this.po?.abrufs[0],
      month: month,
      pgWithRemoteAndOnsite: this.po?.pgWithRemoteAndOnsite
    };

    let dialogRef = this.dialog.open(AddTimesheetEntryComponent, {
      panelClass: 'edit-modal',
      width: '1450px',
      height: '700px',
      disableClose: true,
      data: TimesheetObj
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const currentMonth = moment(month, 'MMM YYYY').month() + 1;
        const currentYear = moment(month, 'MMM YYYYY').year();
        this.getConsultantsByPOIdPgIdMonthAndYear(currentMonth, currentYear, columnIndex);
        this.remainingBudget.emit(this.pg?.id);
      }
    });
  }

  /**Remove consultant from PG */
  removeConsultantFromPG(consultantData: any): void {
    this.poService.checkTimesheetEntry(this.po?._id, this.pg?.id, consultantData.assignmentId).subscribe({
      next: (response: any) => {
        if (response === false){
          let dialogRef = this.dialog.open(ConfirmModalComponent, {
            panelClass: 'edit-modal',
            width: '445px',
            height: '220px',
            disableClose: true,
            data: [Messages.removeConsultantFromPG, Messages.removeConsultantHeading],
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.removePgApiCall(consultantData);
            }
          });
        } else if((response === true)) {
          this.dialog.open(DeleteModalComponent, {
            panelClass: 'edit-modal',
            width: '550px',
            height: '280px',
            disableClose: true,
            data: Util.showModalMessages(Modules.removeConsultant, consultantData.name, Messages.removeConsultantFromPGMessage)
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

  /*** Api call to remove consultant from PG */
  removePgApiCall(consultantData: any): void {
    const poId = this.po?._id;
    const pgId = this.pg?.id;
    const assignmentId = consultantData.assignmentId;
    this.poService.removeConsultantFromPg(poId, pgId, assignmentId).subscribe({
      next: (response: any) => {
        if(response.status === 200) {
          this.dataSource = [];
          this.getConsultantsByPOAndPgId();
          this.consultantCount.emit();
          this.toastr.success('Consultant removed successfully from PG');
        }
      },
      error: (err: HttpErrorResponse) => {
        if(err.status === 409) {
          this.toastr.error('This Consultant cannot be deleted as has timesheet entries');
        }
        console.log(err);
      },
    });
  }

  editConsultantFromPG(consultantData: any): void {
    let objectPoPgConsultant: ObjPoPgConsultant = {
      poNo: this.po?.poNo,
      poId: this.po?._id,
      poStartDate: this.po?.poStartDate,
      poEndDate: this.po?.poEndDate,
      pgId: this.pg?.id,
      pgName: this.pg?.pgName,
      consultantId: consultantData.consultantId,
      consultantName: consultantData.name,
      consulantStartDate: consultantData.startDate,
      consulantEndDate: consultantData.endDate,
      assignmentId: consultantData.assignmentId,
      flag: true
    };
    let dialogRef = this.dialog.open(AssignConsultantComponent, {
      panelClass: 'edit-modal',
      width: '1000px',
      height: '655px',
      disableClose: true,
      data: objectPoPgConsultant
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.dataSource = [];
        this.getConsultantsByPOAndPgId();
        this.consultantCount.emit();
      }
    });
  }
}
