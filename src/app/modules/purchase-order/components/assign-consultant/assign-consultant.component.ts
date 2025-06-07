import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CustomValidators } from '../../../../custom-validator';
import { ConsultantService } from '../../../shared/services/consultant/consultant.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { ConsultantStatus } from '../../../../models/consultants-status-enum';
import { Util } from '../../../../libraries/Util';
import { PoService } from '../../../shared/services/po/po.service';
import { ToastrService } from 'ngx-toastr';
import { Pgmessage } from '../../../../models/pg-messages-enum';
import {IPoPgConsultant} from '../../../../models/po-pg-consultant';

export interface AssignConsultantObj {
  poId: string;
  pgId: string;
  poNo: string;
  pgName: string;
  consultantDetails: any;
}

@Component({
  selector: 'app-assign-consultant',
  templateUrl: './assign-consultant.component.html',
  styleUrl: './assign-consultant.component.scss',
})
export class AssignConsultantComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  isassigningConsultant = false;
  isConsultantFormValid = false;

  public consultantFilterCtrl: FormControl = new FormControl();
  public consultantList: any = new ReplaySubject(1);
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  protected _onDestroy = new Subject();
  protected consultants: any[] = [];

  poStartDate = this.data?.poStartDate;
  poEndDate = this.data?.poEndDate;

  public consultantEditObject!: IPoPgConsultant;
  minDate: any;
  maxDate: any;
  enableText = "You can select to auto generate timesheet for this consultant for this month after saving.";
  disableText = "Timesheet generation for this consultant in this month is not allowed as the start date is beyond the current month";
  noTimesheetTemplateText = "Generation of timesheet not possible as no template is selected in this PO";

  assignConsultantForm = this.fb.group(
    {
      consultantsArray: this.fb.array(
        [
          this.fb.group({
            id: ['', Validators.required],
            startDate: [
              '',
              [
                Validators.required,
                CustomValidators.minDateValidator(this.poStartDate),
              ],
            ],
            endDate: ['', [CustomValidators.maxDateValidator(this.poEndDate)]],
            status: [''],
            generateTs: [{ value: false, disabled: true }]
          }),
        ],
        { validators: [CustomValidators.uniqueControlValidator('id')] }
      ),
    },
    {
      validators: [
        CustomValidators.dateExceedValidator(
          'consultantsArray',
          'startDate',
          'endDate'
        ),
      ],
    }
  );

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<AssignConsultantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly consultantServie: ConsultantService,
    private readonly poService: PoService,
    private readonly toastr: ToastrService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.getAllConsultantsList();
    this.setMinMaxDate();
    this.consultantFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterConsultants();
      });
    this.consultantsArray.controls.forEach((group, index) => {
      this.subscribeToStartDate(group as FormGroup, index);
    });
  }

  ngAfterViewInit(): void {
    this.consultantsArray.statusChanges.subscribe((status) => {
      this.isConsultantFormValid = status !== 'INVALID';
    });
    setTimeout(() => {
      this.populateConsulantData();
    });
  }

  ngOnDestroy() {
    this._onDestroy.complete();
  }

  /** Set the MinDate for the datepicker */
  setMinMaxDate(){
    const [day, month, year] = this.data.poStartDate.split('.');
    const [day1, month1, year1] = this.data.poEndDate.split('.');
    this.minDate = new Date(+year, +month - 1, +day);
    this.maxDate = new Date(+year1, +month1 - 1, +day1);
  }
  /** Subscribe to the start Date */
  private subscribeToStartDate(formGroup: FormGroup, index: number): void {
    const startDateControl = formGroup.get('startDate');
    if (!startDateControl) return;

    startDateControl.valueChanges.subscribe((newValue) => {
      const currentDate = new Date();
      const selectedDate = new Date(newValue);
      const isBeforeOrCurrentMonth =
        selectedDate.getFullYear() < currentDate.getFullYear() ||
        (selectedDate.getFullYear() === currentDate.getFullYear() &&
        selectedDate.getMonth() <= currentDate.getMonth());

      const hasTimesheetTemplate = !!(this.data?.poTimesheetTemplate?.templateName &&
                                      this.data?.poTimesheetTemplate?.timesheetHeaderData);
      const generateTsControl = formGroup.get('generateTs');

      if (isBeforeOrCurrentMonth && hasTimesheetTemplate) {
        generateTsControl?.enable();
      } else {
        if (generateTsControl?.value) {
          generateTsControl?.setValue(false);
        }
        generateTsControl?.disable();
      }
    });
  }
  /** Getting All consultant list */
  getAllConsultantsList(): void {
    this.consultantServie.getAllConsultants().subscribe({
      next: (response: any) => {
        const consultantId = this.data?.consultantId;
        if (consultantId) {
          this.consultants = response.body
            .filter((item: any) => item.id === consultantId)
            .slice();
          this.consultantsArray
            .at(0)
            .get('id')
            ?.setValue(this.consultants.at(0));
        } else {
          this.consultants = response.body.filter(
            (item: any) => item.status === ConsultantStatus.Active
          );
        }
        this.consultantList?.next(this.consultants.slice());
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }
  /** Get methof to fetch the consulatnt array data */
  get consultantsArray() {
    return this.assignConsultantForm.get('consultantsArray') as FormArray;
  }

  compareConsultants(consultant1: any, consultant2: any): boolean {
    return consultant1 && consultant2
      ? consultant2.id === consultant1.id
      : consultant2 === consultant1;
  }

  /** Add new consultant form field to the form array */
  addConsultant(): void {
    if (this.isConsultantFormValid || this.consultantsArray.length < 1) {
      const newGroup = this.fb.group({
        id: ['', Validators.required],
        startDate: [
          '',
          [Validators.required, CustomValidators.minDateValidator(this.poStartDate)]
        ],
        endDate: ['', [CustomValidators.maxDateValidator(this.poEndDate)]],
        status: [''],
        generateTs: [{ value: false, disabled: true }],
      });

      this.consultantsArray.push(newGroup);
      const newIndex = this.consultantsArray.length - 1;
      this.subscribeToStartDate(newGroup, newIndex);
    }
  }
  /** Remove consultant form array */
  removeConsultant(index: any): void {
    this.consultantsArray.removeAt(index);
  }

  private prepareData(): AssignConsultantObj {
    const consultantData = this.assignConsultantForm.value.consultantsArray;
    const consultantDetails = consultantData?.map((consultant: any) => ({
      id: consultant.id.id,
      status: consultant.id.status,
      startDate: Util.dateString(consultant.startDate),
      endDate: Util.dateString(consultant.endDate),
      generateTs: consultant.generateTs ? consultant.generateTs : false,
    }));

    const filterObj: AssignConsultantObj = {
      poId: this.data.poId,
      pgId: this.data.pgId,
      poNo: this.data.poNo,
      pgName: this.data.pgName,
      consultantDetails: consultantDetails,
    }

    return filterObj;
  }

  /** Add Consultant to PG */
  private addConsultantToPG(): void {
    const dataObj: AssignConsultantObj = this.prepareData();
    const generatedTimeshetCount = dataObj?.consultantDetails?.filter((consultant: any) => consultant.generateTs === true).length;
    const generatedBy = JSON.parse(localStorage.getItem('loggedInUser')??"") ?? '';
    this.poService
      .assignConsultantToPG(dataObj, generatedBy)
      .subscribe({
        next: (response: any) => {
          if (response.body && Object.keys(response.body).length > 0) {
            this.isassigningConsultant = false;
            this.handleApiResponse(response.body);
          } else {
            this.dialogRef.close(true);
            this.toastr.success( 'Consultants successfully assigned to PG', '', { newestOnTop: false } );
            if (generatedTimeshetCount != null && generatedTimeshetCount > 0) {
              let message = 'Generating timesheets for ' + generatedTimeshetCount + ' consultant' + (generatedTimeshetCount > 1 ? 's' : '');
              this.toastr.success( message, '', { newestOnTop: false } );
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isassigningConsultant = false;
          console.error(err);
        },
      });
  }

  /** Edit Consultant to PG */
  private async editConsultantToPG(): Promise<void>{
    try {
      const consultantData: any = this.assignConsultantForm.value.consultantsArray;
      if(consultantData){
        if(consultantData.length > 0){
          const formdata = consultantData[0];
          this.consultantEditObject.consulantStartDate = Util.dateString(formdata?.startDate);
          this.consultantEditObject.consulantEndDate = Util.dateString(formdata?.endDate);
        }
      }

      const response: HttpResponse<any> = await this.poService.editAssignedConsultant(this.consultantEditObject);
      if (response.status === 200) {
        this.dialogRef.close(true);
        this.toastr.success('Updated the assigned consultants successfully');
      }
    } catch (error: any) {
      this.isassigningConsultant = false;
      this.toastr.error(error?.error?.detail);
      console.error(JSON.stringify(error));
    }
  }

  async assignConsultants(): Promise<void> {

    this.isassigningConsultant = true;

    if (!this.consultantEditObject.flag) {
      this.addConsultantToPG();
    } else {
      this.editConsultantToPG();
    }
  }

  /** Helper method to handle the API response */
  handleApiResponse(response: any) {
    //  Identify consultants not present in the response
    const indicesToRemove: number[] = [];

    this.consultantsArray.controls.forEach((group: any, index: number) => {
      const consultantId = group.get('id').value.id;
      let idExists = false;

      Object.keys(response).forEach((errorKey) => {
        const errorConsultants = response[errorKey];
        errorConsultants.forEach((errorConsultant: any) => {
          if (errorConsultant.id === consultantId) {
            idExists = true;
          }
        });
      });

      if (!idExists) {
        indicesToRemove.push(index);
      }
    });

    // Remove consultants not present in the response
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      this.consultantsArray.removeAt(indicesToRemove[i]);
    }
    if (indicesToRemove.length !== 0) {
      this.toastr.success(
        indicesToRemove.length + ' consultants successfully assigned to pg'
      );
    }
    // Handle errors for remaining consultants
    Object.keys(response).forEach((errorKey) => {
      const errorConsultants = response[errorKey];
      errorConsultants.forEach((errorConsultant: any) => {
        const consultantGroup = this.consultantsArray.controls.find(
          (group: any) => group.get('id').value.id === errorConsultant.id
        );
        if (consultantGroup) {
          if (errorKey.includes(Pgmessage?.sameTimePeriod)) {
            consultantGroup.get('id')?.setErrors({
              sameTimePeriod: true,
            });
          } else if (errorKey.includes(Pgmessage?.reassigningConsultant)) {
            consultantGroup.get('id')?.setErrors({
              reassigningConsultant: true,
            });
          }
        }
      });
    });
  }

  validateDate(index: any): void {
    if (index >= 0 && index < this.consultantsArray.controls.length) {
      const group = this.consultantsArray.controls[index] as FormGroup;
      const idControl = group.get('id');
      if (idControl) {
        idControl.clearValidators();
        idControl.setErrors(null);
        idControl.setValidators(Validators.required);
        idControl.updateValueAndValidity();
      }
    } else {
      console.error('Index out of bounds');
    }
  }

  /** Helper method to filter the consultant by Name */
  protected filterConsultants() {
    if (!this.consultants) {
      return;
    }

    let search = this.consultantFilterCtrl.value;
    if (!search) {
      this.consultantList.next(this.consultants?.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    this.consultantList.next(
      this.consultants.filter(
        (consultantName: any) =>
          consultantName.firstName.toLowerCase().indexOf(search) > -1 ||
          consultantName.lastName.toLowerCase().indexOf(search) > -1
      )
    );
  }

  populateConsulantData(): void {
    this.consultantEditObject = {
      poNo: this.data?.poNo,
      poId: this.data?.poId,
      poStartDate: this.data?.poStartDate,
      poEndDate: this.data?.poEndDate,
      pgId: this.data?.pgId,
      pgName: this.data?.pgName,
      consultantId: this.data?.consultantId || '',
      consultantName: this.data?.consultantName || '',
      consulantStartDate: this.data?.consulantStartDate || '',
      consulantEndDate: this.data?.consulantEndDate || '',
      assignmentId: this.data?.assignmentId || '',
      flag: this.data?.flag || false,
    };
    if (this.consultantEditObject.flag) {
      this.populateDataForEdit();
    }
  }

  private populateDataForEdit(): void {
    let formattedStartDate: any = Util.convertToMomentDateFormat(
      this.consultantEditObject.consulantStartDate ?? ""
    );
    let formattedEndDate: any = Util.convertToMomentDateFormat(
      this.consultantEditObject.consulantEndDate ?? ""
    );
    this.assignConsultantForm
      .get('consultantsArray.0.startDate')
      ?.setValue(formattedStartDate, { emitEvent: false });
    this.assignConsultantForm
      .get('consultantsArray.0.endDate')
      ?.setValue(formattedEndDate, { emitEvent: false });
    this.assignConsultantForm
      .get('consultantsArray.0.id')
      ?.disable({ onlySelf: true, emitEvent: false });
    this.cdr.detectChanges();
  }

  /** Helper method to close the dialog box */
  closeDialog(isCreated: boolean): void {
    if (this.assignConsultantForm.dirty) {
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
}
