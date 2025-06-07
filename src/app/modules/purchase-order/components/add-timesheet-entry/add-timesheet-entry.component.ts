import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Messages } from '../../../../models/message-enum';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Util } from '../../../../libraries/Util';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { RegEx } from '../../../../libraries/RegEx';

@Component({
  selector: 'app-add-timesheet-entry',
  templateUrl: './add-timesheet-entry.component.html',
  styleUrl: './add-timesheet-entry.component.scss',
})
export class AddTimesheetEntryComponent implements OnInit {
  isAddingTimesheet: boolean = false;
  dataSource: any = [];
  displayedColumns: string[] = [
    'consultant',
    'startDate',
    'endDate',
    'onsite',
    'remote',
    'total',
  ];
  processedEntries = 0;
  errorOccurred = false;
  errorMessage = '';

  errorArray: any = [];
  errorIndices: number[] = []; // Array to hold indices with errors
  addTimesheetEntryForm = this.fb.group({
    timesheetArray: this.fb.array([]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddTimesheetEntryComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    public toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData(this.data.consultantList);
  }

  closeDialog(isCreated: boolean): void {
    if (this.addTimesheetEntryForm.dirty) {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.closeConfirm, ''],
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.dialogRef.close(true);
        }
      });
    } else {
      this.dialogRef.close(isCreated);
    }
  }

  get timesheetArray(): FormArray {
    return this.addTimesheetEntryForm.get('timesheetArray') as FormArray;
  }

  loadData(data: any): void {
    this.dataSource = data;

    // Clear the FormArray and add new controls
    this.timesheetArray.clear();
    data.forEach((entry: any) => {
      this.timesheetArray.push(this.createTimesheetEntryArray(entry));
    });
  }

  createTimesheetEntryArray(entry: any): FormGroup {
    const currentMonth = moment(this.data.month, 'MMM YYYY').month() + 1;
    const currentYear = moment(this.data.month, 'MMM YYYYY').year();
    const entryForm = this.fb.group({
      id: [this.getIdOfConsultantEntry(entry.columns, this.data.month) || ''],
      poId: [this.data.poId || ''],
      abrufId: [this.data.abrufId || ''],
      pgId: [this.data.pgId || ''],
      consultantId: [entry.consultantId || ''],
      assignmentId: [entry.assignmentId || ''],
      month: [currentMonth || 0],
      year: [currentYear || 0],
      onsiteHrs: [Util.convertNumberToLocalFormat(this.getOnsitehrsOfConsultantEntry(entry.columns, this.data.month)), [Validators.pattern(RegEx.getRedgexForTimesheetEntry())]],
      remoteHrs: [Util.convertNumberToLocalFormat(this.getRemotehrsOfConsultantEntry(entry.columns, this.data.month)), [Validators.pattern(RegEx.getRedgexForTimesheetEntry())]],
      totalHrs: [Util.convertNumberToLocalFormat(this.getTotalhrsOfConsultantEntry(entry.columns, this.data.month))]
    });

    const consultantEndDateValidate = moment(this.data.month, 'MMMM YYYY').isAfter(moment(entry.endDate, 'DD.MM.YYYY'), 'month');
    const consultantStartDateValidate = moment(this.data.month, 'MMMM YYYY').isBefore(moment(entry.startDate, 'DD.MM.YYYY'), 'month');

    if (!this.data.pgWithRemoteAndOnsite) {
      entryForm.get('remoteHrs')?.disable();
    }

    if (consultantEndDateValidate || consultantStartDateValidate) {
      entryForm.get('onsiteHrs')?.disable();
      entryForm.get('remoteHrs')?.disable();
      entryForm.get('totalHrs')?.disable();
    }

    this.subscribeToChanges(entryForm);
    return entryForm;
  }

  getIdOfConsultantEntry(timesheetEntryData: any, currentMonth: any): string {
    for (const key in timesheetEntryData) {
      if (timesheetEntryData[key].header === currentMonth) {
        return timesheetEntryData[key].id;
      }
    }
    return '';
  }

  getOnsitehrsOfConsultantEntry(timesheetEntryData: any, currentMonth: any): number {
    for (const key in timesheetEntryData) {
      if (timesheetEntryData[key].header === currentMonth) {
        return timesheetEntryData[key].onsiteHrs;
      }
    }
    return 0;
  }

  getRemotehrsOfConsultantEntry(timesheetEntryData: any, currentMonth: any): number {
    for (const key in timesheetEntryData) {
      if (timesheetEntryData[key].header === currentMonth) {
        return timesheetEntryData[key].remoteHrs;
      }
    }
    return 0;
  }

  getTotalhrsOfConsultantEntry(timesheetEntryData: any, currentMonth: any): number {
    for (const key in timesheetEntryData) {
      if (timesheetEntryData[key].header === currentMonth) {
        return timesheetEntryData[key].totalHrs;
      }
    }
    return 0;
  }

  subscribeToChanges(entryForm: FormGroup): void {
    const onsiteHrsControl = entryForm.get('onsiteHrs');
    const remoteHrsControl = entryForm.get('remoteHrs');

    onsiteHrsControl?.valueChanges.subscribe((value) => {
      if (value === ''){
        onsiteHrsControl.setValue(value.trim(), { emitEvent: false });
      }
      this.calculateTotalHrs(entryForm);
    });

    remoteHrsControl?.valueChanges.subscribe((value) => {
      if (value === ''){
        remoteHrsControl.setValue(value.trim(), { emitEvent: false });
      }
      this.calculateTotalHrs(entryForm);
    });
  }

  calculateTotalHrs(entryForm: FormGroup): void {
    const onsiteHrs = Util.convertStrToNumber(entryForm.get('onsiteHrs')?.value) || 0;
    const remoteHrs = Util.convertStrToNumber(entryForm.get('remoteHrs')?.value) || 0;
    const totalHrs = onsiteHrs + remoteHrs;
    entryForm.get('totalHrs')?.setValue(this.formatCalculation(totalHrs), { emitEvent: false });
    if (totalHrs > 200) {
      entryForm.get('totalHrs')?.setErrors({ maxValueReached : true });
      entryForm.get('totalHrs')?.markAsTouched()
    }
  }

  formatCalculation(param: number): string {
    const result = Util.convertNumberToLocalFormat(param);
    if (result) {
      return result;
    }
    return '0,0';
  }

  parseHours(hours: any): any {
    if (hours === null || hours === '') return 0;
    if (!Util.isNumeric(hours))
      hours = hours?.replace(',', '.');
      return parseFloat(hours);
  }

  addTimeSheetEntry(): void {
    this.isAddingTimesheet = true;
    const originalArray = this.addTimesheetEntryForm.value.timesheetArray;

    // Filter out timesheet entries with valid hour values
    const timesheet = originalArray?.filter((key: any) =>
      key.onsiteHrs !== undefined
      // key.remoteHrs !== undefined
    );
    console.log(originalArray,timesheet)

    const totalEntries = timesheet?.length ?? 0;
    if (totalEntries === 0) {
      this.isAddingTimesheet = false;
      return;
    }

    this.errorArray = [];

    // Process each timesheet entry
    timesheet?.forEach((entry: any) => {
      entry.onsiteHrs = this.parseHours(entry.onsiteHrs);
      entry.remoteHrs = (entry.remoteHrs === null || entry.remoteHrs === undefined) ? this.parseHours("0,00") : this.parseHours(entry.remoteHrs);
      entry.totalHrs = this.parseHours(entry.totalHrs);

      this.createTimesheetEntryApi(
        entry,
        () => this.handleSuccess(totalEntries),
        (err: any) => this.handleError(err, entry, totalEntries)
      );
    });
  }

  handleSuccess(totalEntries: any): void {
    this.processedEntries++;
      if (this.processedEntries === totalEntries) {
        if (!this.errorOccurred) {
          this.dialogRef.close(true);
          this.toastr.success('Timesheet entered successfully');
        }
        this.isAddingTimesheet = false;
      }
  }

  handleError(err: any, entry: any, totalEntries: any): void {
    this.errorOccurred = true;
      this.errorArray.push(entry);
      this.markErrorControls();

      if (!this.errorMessage) {
        this.errorMessage = err.error.detail || 'Error occurred while entering timesheet(s)';
      }

      this.processedEntries++;
      if (this.processedEntries === totalEntries) {
        this.toastr.info((totalEntries - this.errorArray.length) +' entries got saved ' + this.errorArray.length + ' has errors')
        this.toastr.error(this.errorMessage, '', { timeOut: 30000 });
        this.isAddingTimesheet = false;
      }
  }

  markErrorControls(): void {
    this.errorArray.forEach((element: any) => {
      const group = this.timesheetArray.controls.find((control: any) =>
        control.get('assignmentId').value === element.assignmentId &&
        control.get('consultantId').value === element.consultantId
      );
      if (group) {
        ['remoteHrs', 'onsiteHrs'].forEach((field) => {
          const control = group.get(field);
          if (control) {
            control.setErrors({ timesheetDateRange: true });
            control.markAsTouched(); // Ensure the control is marked as touched to trigger validation
          }
        });
      }
    });
  }

  createTimesheetEntryApi(timesheetData: any, onSuccess: () => void, onError: (err: any) => void): void {
    this.timesheetService.createTimesheetEntry(timesheetData).subscribe({
      next: (response: any) => {
        if (response.status === 201) {
          onSuccess();
        } else {
          onError(new Error('Unexpected response status'));
        }
      },
      error: (err: any) => {
        onError(err);
      }
    });
  }

  formatAndValidate(controlName: string): void {
    const control = this.addTimesheetEntryForm.get(controlName);
    const value = control?.value;

    if (value) {
      if (!isNaN(value)) {
        // Check if the value doesn't contain a comma
        if (!/\.\d+$/.test(value)) {
          // If value doesn't contain a comma and decimal part, append ',00'
          control?.setValue(`${value},00`, { emitEvent: false });
        }
      }
      if (value.lastIndexOf(',') === value.length - 1) {
        // If the last position is a comma, add '00' after that comma
        control?.setValue(`${value}00`, { emitEvent: false });
      }
      const secondLastChar = value.charAt(value.length - 2);
      const lastChar = value.charAt(value.length - 1);
      if (secondLastChar === ',' && !isNaN(lastChar)) {
        // If the previous last value is a comma and the last value is a number, add another '0' at the last position
        control?.setValue(`${value}0`, { emitEvent: false });
      }
    }
    control?.updateValueAndValidity();
  }

  moveCaretToStart(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    requestAnimationFrame(() => {
      input.setSelectionRange(0, 0);
    });
  }
}
