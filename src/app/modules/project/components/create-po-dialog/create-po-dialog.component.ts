import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { ClientProjectService } from '../../../shared/services/client-project/client-project.service';
import { CustomValidators } from '../../../../custom-validator';
import { Util } from '../../../../libraries/Util';
import { PoService } from '../../../shared/services/po/po.service';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { AbrufStatus } from '../../../../models/abruf-status-enum';
import { RegEx } from '../../../../libraries/RegEx';
import { InfoModalComponent } from '../../../shared/modals/info-modal/info-modal.component';
import moment from 'moment';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';
import { Modules } from '../../../../models/modules-enum';
import { TimesheetTemplate } from '../../../../models/timesheet-template';
import { TimesheetTemplateService } from '../../../shared/services/timesheet-template/timesheet-template.service';
import { AssignStatusEnum } from '../../../../models/assign-status-enum';
@Component({
  selector: 'app-create-po-dialog',
  templateUrl: './create-po-dialog.component.html',
  styleUrl: './create-po-dialog.component.scss',
})
export class CreatePoDialogComponent
  implements
    OnInit,
    OnDestroy,
    AfterViewInit,
    AfterContentInit,
    AfterViewChecked
{
  private readonly destroy$ = new Subject<void>();

  public projectCtrl: FormControl = new FormControl('', [Validators.required]);
  public projectFilterCtrl: FormControl = new FormControl();
  public filteredProjects: any = new ReplaySubject(1);
  public templateCtrl: FormControl = new FormControl('');
  public templateFilterCtrl: FormControl = new FormControl();
  public filteredTemplates: any = new ReplaySubject(1);
  projectWithClients: any = [];
  hasRemoteTimesheet: boolean = false;

  @ViewChildren('abrufSelect') abrufSelects!: QueryList<MatSelect>;
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  selectedCurrency = '€';

  isCreatingPO = false;
  isPgFormValid = false;
  isRemoteAndOnsiteChecked: any = true;
  isAbrufValid = false;
  mode = '';
  counterProjectSelect: number = 0;
  createPOForm = this.fb.group(
    {
      id: [''],
      projectId: [''],
      clientId: [''],
      poNo: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\/\\]*$/)]], // , Validators.pattern(/^[a-zA-Z0-9]*$/)
      poDate: [''],
      poStartDate: ['', Validators.required],
      poEndDate: ['', Validators.required],
      currency: ['EUR'],
      notes: ['', [Validators.maxLength(1000)]],
      poTotalBudget: ['0'],
      status: ['ACTIVE'],
      abrufs: this.fb.array(
        [
          this.fb.group({
            abruf: ['', Validators.required],
          }),
        ],
        { validators: [CustomValidators.uniqueControlValidator('abruf')] }
      ),
      pgs: this.fb.array([]),
      pgWithRemoteAndOnsite: [true],
      poTimesheetTemplate: this.fb.group({
        templateId: [''],
        templateName: [''],
        url: [''],
        filename: [''],
        timesheetHeaderData: [new Map<string, string>()],
        status: []
      }),
      vcId: ['']
    },
    {
      validators: [
        CustomValidators.dateRangeValidator('poStartDate', 'poEndDate'),
      ],
    }
  );
  poAmount: number = 0;
  poAmountRemote: number = 0;
  poAmountOnsite: number = 0;
  poId: string = '';
  poDbData: any = {};

  protected _onDestroy = new Subject();
  clientProjectList: any = [];

  filteredAbrufs: any = [];

  pgBudgetObj = [];

  noTemplateNeeded: TimesheetTemplate = {
    id: '',
    templateName: 'No Timesheet Template Needed',
    url: '',
    timesheetHeaderData: new Map<string, string>(),
    status: 'ACTIVE',
  }

  templates: TimesheetTemplate[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreatePoDialogComponent>,
    public dialogRefConfirm: MatDialogRef<DeleteModalComponent>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private clientProjectService: ClientProjectService,
    private poService: PoService,
    private _templateService: TimesheetTemplateService,
  ) {
    this.dialogRef.disableClose = true;
    this.poId = this.extractPoIdFromInjectedData(data);
  }

  async ngOnInit() {
    // Reserved For future use
    // this.getProjectWithClientAndPopulate();
    this.templateFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterTemplates();
      });
  }

  ngAfterContentInit(): void {
    this.getAllTemplates();
    this.getProjectWithClientAndPopulate();
  }

  ngAfterViewInit() {
    // this.setInitialValue();
    this.pgFormArray.statusChanges.subscribe((status) => {
      this.isPgFormValid = status !== 'INVALID';
    });
    this.abrufs.statusChanges.subscribe((status) => {
      this.isAbrufValid = status !== 'INVALID';
    });
    this.createPOForm.valueChanges.subscribe(() => {
      let onsiteBudgetTotals = this.totalOnsiteBudget ?? 0;
      let remoteBudgetTotals = this.totalRemoteBudget ?? 0;

      let checkedRemoteAndOnsite = this.createPOForm?.get(
        'pgWithRemoteAndOnsite'
      )?.value;
      if (
        checkedRemoteAndOnsite !== null &&
        checkedRemoteAndOnsite !== undefined
      ) {
        if (!checkedRemoteAndOnsite) {
          remoteBudgetTotals = 0;
        }
      }
      let totals = onsiteBudgetTotals + remoteBudgetTotals;
      if (!Util.isNumeric(totals)) {
        totals = 0;
      }
      this.createPOForm
        ?.get('poTotalBudget')
        ?.setValue(Util.convertNumberToLocalFormat(totals), {
          emitEvent: false,
        });
    });
  }

  ngAfterViewChecked() {
    // Reserved For future use
  }

  ngOnDestroy() {
    this._onDestroy.complete();
  }

  checkAbrufRequirement() {
    if (!this.projectCtrl.value?.abrufRequired) {
      this.setNoAbruf();
    } else {
      this.setAbruf();
    }
  }

  setAbruf() {
    const abrufArray = this.createPOForm.get('abrufs') as FormArray;
    abrufArray.controls.forEach((control) => {
      control.get('abruf')?.setValue('');
      control.get('abruf')?.enable();
    });
  }

  setNoAbruf() {
    const noAbruf = this.filteredAbrufs.find(
      (abruf: any) => abruf.abrufName === 'No Abruf'
    );
    const abrufArray = this.createPOForm.get('abrufs') as FormArray;
    abrufArray.controls.forEach((control) => {
      control.get('abruf')?.setValue(noAbruf);
      control.get('abruf')?.disable();
    });
  }

  filterAbrufWithProjectAndClient(projectId: string, clientId: string): void {
    this.isCreatingPO = true;
    this.clientProjectService
      .filterAbrufWithProjectAndClient(projectId, clientId)
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            if (this.projectCtrl.value?.abrufRequired) {
              this.filteredAbrufs = response.body[0]?.abrufs.filter(
                (abruf: any) =>
                  abruf.status === AbrufStatus.active &&
                  abruf.abrufName !== 'No Abruf'
              );
            } else {
              this.filteredAbrufs = response.body[0]?.abrufs.filter(
                (abruf: any) => abruf.status === AbrufStatus.active
              );
            }
            if (this.filteredAbrufs?.length === 0) {
              this.showNoAbrufModal();
            }
            this.checkAbrufRequirement();
            this.isCreatingPO = false;

            this.populateAbrufsAndPGs();
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('An error occurred:', err.message);
          this.isCreatingPO = false;
        },
      });
  }

  getProjectWithClientAndPopulate() {
    this.getClientProject();

    this.projectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProjectWithClients();
      });

    this.projectCtrl.valueChanges.subscribe((selectedValue) => {
      if (selectedValue) {
        this.filterAbrufWithProjectAndClient(
          selectedValue.projectId,
          selectedValue.clientId
        );
      }
    });
  }

  showNoAbrufModal() {
    let dialogRef = this.dialog.open(InfoModalComponent, {
      panelClass: 'edit-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.noAbrufText, Messages.noAbrufHeading],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.closeDialog(false);
      }
    });
  }

  getAllTemplates() {
    this._templateService.getAllTemplates()
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res: any[]) => {
          // Filter out entries with null templateName or status
          this.templates = res.filter((template: TimesheetTemplate) =>
            template.templateName != null &&
            template.templateName !== '' &&
            template.status != null
          );
          this.templates.unshift(this.noTemplateNeeded);
          this.filteredTemplates.next(this.templates.slice());
        },
        error: (err: { error: { message: any; }; }) => {
          console.error('Error fetching templates:', err);
          this.toastr.error(err.error?.message || 'Failed to fetch templates');
        }
    });
  }

  getClientProject(): void {
    this.isCreatingPO = true;
    this.clientProjectService.getAssociatedClientProject().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          response.body = response.body.filter((item: any) => item.status === AssignStatusEnum.active);
          if (this.data?._id) {
            this.projectWithClients = response.body.filter((item: any) => item.projectId === this.data._id).slice();
          } else {
            this.projectWithClients = response.body;
          }
          this.filteredProjects?.next(this.projectWithClients.slice());
          if (!this.checkModeAsUpdate()) {
            this.isCreatingPO = false;
          }
          this.populateFormWithDataFromDb();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('An error occurred:', err.message);
        this.isCreatingPO = false;
      },
    });
  }

  addAbruf() {
    const lastElement = this.abrufs.at(this.abrufs.length - 1)?.value.abruf.id;
    if (
      lastElement !== '' &&
      lastElement !== null &&
      lastElement !== undefined &&
      this.projectCtrl.value?.abrufRequired
    ) {
      this.abrufs.push(
        this.fb.group({
          abruf: ['', Validators.required],
        })
      );
    }
  }

  get abrufs() {
    return this.createPOForm.controls['abrufs'] as FormArray;
  }

  deleteAbruf(index: any): void {
    this.abrufs.removeAt(index);
    this.createPOForm.markAsDirty();
  }

  compareClients(client1: any, client2: any): boolean {
    return client1 && client2 ? client2.id === client1.id : client2 === client1;
  }

  // protected setInitialValue() {
  //   this.filteredProjects
  //     .pipe(take(1), takeUntil(this._onDestroy))
  //     .subscribe(() => {
  //       this.singleSelect.compareWith = (a: any, b: any) =>
  //         a && b && a.id === b.id;
  //     });
  // }

  protected filterProjectWithClients() {
    if (!this.projectWithClients) {
      return;
    }

    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredProjects.next(this.projectWithClients.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    this.filteredProjects.next(
      this.projectWithClients.filter(
        (item: any) =>
          item.projectName.toLowerCase().indexOf(search) > -1 ||
          item.shortName.toLowerCase().indexOf(search) > -1
      )
    );
  }

  protected filterTemplates() {
    if (!this.templates) {
      return;
    }

    let search = this.templateFilterCtrl.value;
    if (!search) {
      this.filteredTemplates.next(this.templates.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    this.filteredTemplates.next(
      this.templates.filter(
        (item: any) =>
          item.templateName.toLowerCase().indexOf(search) > -1
      )
    );
  }

  convertDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  closeDialog(isCreated: boolean): void {
    if (this.createPOForm.dirty ||
       (this.projectCtrl.dirty && this.filteredAbrufs.length > 0)) {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.closeConfirm, ''],
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close(isCreated);
    }
  }

  savePO(): void {
    this.isCreatingPO = true;
    this.createPOForm.get('pgWithRemoteAndOnsite')?.enable();
    this.createPOForm
      .get('projectId')
      ?.setValue(this.projectCtrl?.value.projectId);
    this.createPOForm
      .get('clientId')
      ?.setValue(this.projectCtrl.value.clientId);
    this.createPOForm.get('status')?.setValue('ACTIVE');
    this.createPOForm.get('poTimesheetTemplate')?.get('templateId')?.setValue(this.templateCtrl?.value?.id);
    this.createPOForm.get('poTimesheetTemplate')?.get('templateName')?.setValue(this.templateCtrl?.value?.templateName);
    this.createPOForm.get('poTimesheetTemplate')?.get('url')?.setValue(this.templateCtrl?.value?.url);
    this.createPOForm.get('poTimesheetTemplate')?.get('timesheetHeaderData')?.setValue(this.templateCtrl?.value?.timesheetHeaderData);
    this.createPOForm.get('poTimesheetTemplate')?.get('status')?.setValue(this.templateCtrl?.value?.status);
    this.createPOForm.get('poTimesheetTemplate')?.get('filename')?.setValue(this.templateCtrl?.value?.filename);
    const formValues = { ...this.createPOForm.value };

    // Remove thousand separators from poTotalBudget before sending to API
    if (formValues.poTotalBudget) {
      formValues.poTotalBudget = formValues.poTotalBudget.replace(/\./g, '');
    }

    // Remove thousand separators from PG budgets
    if (formValues.pgs && Array.isArray(formValues.pgs)) {
      formValues.pgs = formValues.pgs.map((pg: any) => Object.assign({}, pg, {
        totalOnsiteBudget: parseFloat(pg.totalOnsiteBudget?.replace(/\./g, '').replace(',', '.')),
        totalRemoteBudget: parseFloat(pg.totalRemoteBudget?.replace(/\./g, '').replace(',', '.')),
        totalOnsiteDays: parseFloat(pg.totalOnsiteDays?.replace(/\./g, '').replace(',', '.')),
        totalRemoteDays: parseFloat(pg.totalRemoteDays?.replace(/\./g, '').replace(',', '.'))
      }));
    }

    formValues.poDate = Util.dateString(this.createPOForm.get('poDate')?.value);
    formValues.poStartDate = Util.dateString(
      this.createPOForm.get('poStartDate')?.value
    );
    formValues.poEndDate = Util.dateString(
      this.createPOForm.get('poEndDate')?.value
    );
    const noAbruf = this.filteredAbrufs.find(
      (abruf: any) => abruf.abrufName === 'No Abruf'
    );
    const formattedData = {
      ...formValues,
      abrufs: this.projectCtrl.value?.abrufRequired
        ? formValues.abrufs?.map((abruf: any) => abruf.abruf.id)
        : [noAbruf?.id],
      endClients: this.data.endClients
    };

    if (this.checkModeAsUpdate()) {
      this.updatePO(formattedData, this.poId);
    } else {
      this.createPo(formattedData);
    }
  }

  private createPo(model: any): void {
    this.poService.createPO(model).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 201) {
          this.dialogRef.close(true);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isCreatingPO = false;
        if (err.status === 409) {
          this.toastr.error('PO Number already exists');
          this.createPOForm.get('poNo')?.setErrors({ duplicatePoNo: true });
        }
        console.error('An error occurred:', err.message);
      },
    });
  }

  private async updatePO(model: any, id: string): Promise<void> {
    try {
      const response: HttpResponse<any> = await this.poService.updatePO(
        model,
        id
      );
      if (response.status === 200) {
        this.dialogRef.close(true);
      }
      return response.body;
    } catch (error: any) {
      this.isCreatingPO = false;
      if(Util.isHttp409Error(error)){
        this.hasRemoteTimesheet ? this.createPOForm.get('pgWithRemoteAndOnsite')?.disable() : this.createPOForm.get('pgWithRemoteAndOnsite')?.enable();
        this.createPOForm.markAsDirty();
        this.handleErrorMessages(error?.error.detail);
      }
    }
  }

  /*** 409 error messages */
  handleErrorMessages(response: any): void {
    if((response).includes('duplicate key')){
      this.toastr.error('PO Number already exists');
      this.createPOForm.get('poNo')?.setErrors({ duplicatePoNo: true });
    } else if((response).includes('PO End-date')){
      this.toastr.error(response,'',{timeOut: 30000});
      this.createPOForm.get('poEndDate')?.setErrors({ poEndDateError: true });
    } else if((response).includes('PO Start-date')){
      this.toastr.error(response,'',{timeOut: 30000});
      this.createPOForm.get('poStartDate')?.setErrors({ poStartDateError: true });
    } else if((response).includes('PO Date-range')){
      this.toastr.error(response,'',{timeOut: 30000});
      this.createPOForm.get('poEndDate')?.setErrors({ poEndDateError: true });
      this.createPOForm.get('poStartDate')?.setErrors({ poStartDateError: true });
    }else {
      this.toastr.error(response,'',{timeOut: 30000});
    }
  }

  setPg() {
    const pgArray = this.createPOForm.get('pgs') as FormArray;
    pgArray.controls.forEach((control) => {});
  }

  onselCurrencyChange(event: MatSelectChange) {
    const currency = event.value;
    if (currency) {
      this.selectedCurrency = this.getCurrencySymbol(currency);
    }
  }

  getCurrencySymbol(currency: string): string {
    switch (currency) {
      case 'CHF':
        return 'chf';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'USD':
        return '$';
      default:
        return '';
    }
  }

  createPgFormGroup() {
    const isModeUpdate = this.checkModeAsUpdate();
    const isBothRemoteAndOnsite = this.createPOForm?.get('pgWithRemoteAndOnsite')?.value ?? false;
    const group = this.fb.group({
      pgName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[^\/\\]*$/),
          Validators.maxLength(100),
          Validators.minLength(2),
          this.checkDuplicatePgName,
        ],
      ],
      totalOnsiteHours: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.pattern(RegEx.getRegExForPositiveNumbers()),
        ],
      ],
      onsiteRate: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.pattern(RegEx.getRegExForPositiveNumbers()),
        ],
      ],
      totalOnsiteBudget: [{ value: '', disabled: true }],
      totalOnsiteDays: [{ value: '', disabled: true }],
      totalRemoteHours: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.pattern(RegEx.getRegExForWholeNumbersWithCheck(isModeUpdate,isBothRemoteAndOnsite)),
        ],
      ],
      remoteRate: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.pattern(RegEx.getRegExForWholeNumbersWithCheck(isModeUpdate,isBothRemoteAndOnsite)),
        ],
      ],
      prevTotalRemoteHours: [''],
      prevRemoteRate: [''],
      totalRemoteBudget: [{ value: '', disabled: true }],
      totalRemoteDays: [{ value: '', disabled: true }],
      status: [{ value: '', disabled: true }],
      onsiteBudget: [{ value: 0 }],
      remoteBudget: [{ value: 0 }],
      pgId: [''],
      id: [''],
      pgConsultants: this.fb.array([])
    });

    this.subscribeToValueChanges(group);

    return group;
  }

  controlsToReset: { [key: string]: string } = {
    totalRemoteHours: '0',
    remoteRate: '0,00',
    totalRemoteBudget: '0,00',
    totalRemoteDays: '0',
    remoteBudget: '0',
  };

  get totalOnsiteBudget(): number {
    let total = 0;
    this.pgFormArray.controls.forEach((group) => {
      const value = group?.get('onsiteBudget')?.value;
      if (value && !isNaN(value)) {
        total += Number(value);
      }
    });
    return total;
  }

  get totalRemoteBudget(): number {
    let total = 0;
    this.pgFormArray.controls.forEach((group) => {
      const value = group?.get('remoteBudget')?.value;
      if (value && !isNaN(value)) {
        total += Number(value);
      }
    });
    return total;
  }

  subscribeToValueChanges(group: FormGroup) {
    this.subscribeToPgNameChanges(group);
    this.subscribeToOnsiteChanges(group);
    this.subscribeToRemoteChanges(group);
  }

  subscribeToPgNameChanges(group: FormGroup) {
    group.get('pgName')?.valueChanges.subscribe(() => {
      this.onPgNameInput(group);
    });
  }

  onPgNameInput(group: FormGroup) {
    const pgNameControl = group.get('pgName');
    const isPgNameEmpty = !pgNameControl?.value;

    Object.keys(group.controls).forEach((key) => {
      if (key !== 'pgName') {
        const control = group.get(key);
        if (isPgNameEmpty) {
          control?.disable();
        } else {
          control?.enable();
        }
      }
    });
  }

  subscribeToOnsiteChanges(group: FormGroup) {
    group.get('totalOnsiteHours')?.valueChanges.subscribe(() => {
      this.calculateTotalOnsiteBudget(group);
      this.calculateTotalOnsiteDays(group);
    });

    group.get('onsiteRate')?.valueChanges.subscribe(() => {
      this.calculateTotalOnsiteBudget(group);
      this.calculateTotalOnsiteDays(group);
    });
  }

  subscribeToRemoteChanges(group: FormGroup) {
    group.get('totalRemoteHours')?.valueChanges.subscribe(() => {
      this.calculateTotalRemoteBudget(group);
      this.calculateTotalRemoteDays(group);
    });

    group.get('remoteRate')?.valueChanges.subscribe(() => {
      this.calculateTotalRemoteBudget(group);
      this.calculateTotalRemoteDays(group);
    });
  }

  formatCalculation(param: number): string {
    const result = Util.convertNumberToLocalFormat(param);
    if (result) {
      return result;
    }
    return '0,0';
  }

  calculateTotalOnsiteBudget(group: FormGroup) {
    const totalOnsiteHours = Util.convertStrToNumber(
      group.get('totalOnsiteHours')?.value
    );
    const onsiteRate = Util.convertStrToNumber(group.get('onsiteRate')?.value);
    const calculation = totalOnsiteHours * onsiteRate;
    group.get('onsiteBudget')?.setValue(calculation);
    group.get('totalOnsiteBudget')?.setValue(Util.convertZeroValueForTotals(this.formatCalculation(calculation)));
  }

  calculateTotalOnsiteDays(group: FormGroup) {
    const totalOnsiteHours = Util.convertStrToNumber(
      group.get('totalOnsiteHours')?.value
    );
    const calculation = totalOnsiteHours / 8;
    group.get('totalOnsiteDays')?.setValue(this.formatCalculation(calculation));
  }

  calculateTotalRemoteBudget(group: FormGroup) {
    const totalRemoteHours = Util.convertStrToNumber(
      group.get('totalRemoteHours')?.value
    );
    const remoteRate = Util.convertStrToNumber(group.get('remoteRate')?.value);
    const calculation = totalRemoteHours * remoteRate;
    group.get('remoteBudget')?.setValue(calculation);
    group.get('totalRemoteBudget')?.setValue(Util.convertZeroValueForTotals(this.formatCalculation(calculation)));
  }

  calculateTotalRemoteDays(group: FormGroup) {
    const totalRemoteHours = Util.convertStrToNumber(
      group.get('totalRemoteHours')?.value
    );
    const calculation = totalRemoteHours / 8;
    group.get('totalRemoteDays')?.setValue(this.formatCalculation(calculation));
  }

  createPgFormBuilderArray() {
    return this.fb.array([this.createPgFormGroup()]);
  }

  addNewPg() {
    if (this.isPgFormValid || this.pgFormArray.length < 1) {
      this.pgFormArray.push(this.createPgFormGroup());
      //Set remote to 0 for unchecked
      if (!this.isRemoteAndOnsiteChecked) {
        this.disableRemoteValues();
      }
    }
  }

  get pgFormArray() {
    return this.createPOForm.controls['pgs'] as FormArray;
  }

  onChkRemoteAndOnsiteChecked() {
    if (!this.createPOForm.get('pgWithRemoteAndOnsite')?.value && this.checkRemoteBudgetOrDays()) {
      this.createPOForm.get('pgWithRemoteAndOnsite')?.setValue(true);
      this.confirmUncheckedRemoteAndOnsite();
    } else {
      this.disableRemoteValues();
    }
  }

  confirmUncheckedRemoteAndOnsite() {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'edit-modal',
      width: '500px',
      height: '240px',
      disableClose: true,
      data: [Messages.uncheckRemoteAndOnsite, Messages.uncheckHeading],
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result)
      if (result) {
        this.createPOForm.get('pgWithRemoteAndOnsite')?.setValue(false);
        this.disableRemoteValues();
      } else {
        this.createPOForm.get('pgWithRemoteAndOnsite')?.setValue(true);
      }
    });
  }

  checkRemoteBudgetOrDays(): boolean {
    const pgArray = this.pgFormArray;
    return pgArray.controls.some((abstractControl: AbstractControl) => {
      const group = abstractControl as FormGroup;
      const totalRemoteBudgetStr = group.get('totalRemoteBudget')?.value;
      const totalRemoteDaysStr = group.get('totalRemoteDays')?.value;

      // Convert '0,00' format to a number
      const totalRemoteBudget = parseFloat(totalRemoteBudgetStr.replace(',', '.'));
      const totalRemoteDays = parseFloat(totalRemoteDaysStr.replace(',', '.'));

      // Check if either totalRemoteBudget or totalRemoteDays is greater than 0
      return totalRemoteBudget > 0 || totalRemoteDays > 0;
    });
  }


  readonlyControls: { [key: string]: boolean } = {};
  disableRemoteValues(): void {
    this.isRemoteAndOnsiteChecked = this.createPOForm.get('pgWithRemoteAndOnsite')?.value;
    const pgArray = this.pgFormArray;
    pgArray.controls.forEach((abstractControl: AbstractControl) => {
      const group = abstractControl as FormGroup;
      let formControlpgId = group.get('pgId')?.value;
      let pgId = '';
      if (!Util.strIsNullOrEmpty(formControlpgId)) {
        pgId = formControlpgId;
      }
      let prevTotalRemoteHours = group.get('prevTotalRemoteHours')?.value;
      let prevRemoteRate = group.get('prevRemoteRate')?.value;
      Object.keys(this.controlsToReset).forEach((key) => {
        const control = group.get(key);
        const pgName = group.get('pgName');
        if (control) {
          control.enable();
          if (!this.isRemoteAndOnsiteChecked) {
            this.readonlyControls[key] = true;
            if (Util.strIsNullOrEmpty(pgId)) {
              control.setValue(this.controlsToReset[key]);
            }
            else{
              group.get('totalRemoteHours')?.setValue('0,00');
              group.get('remoteRate')?.setValue('0,00');
            }
          } else if (!Util.strIsNullOrEmpty(pgName?.value)) {
            this.readonlyControls[key] = false;
            if (Util.strIsNullOrEmpty(pgId)) {
              control.setValue(this.controlsToReset[key]);

            }
          }
        }
      });
    });
  }

  deletePg(index: any, pgId: any, pgName: any): void {
    if (pgId) {
      const poIdValue: any = { poId: this.poId, pgId: pgId, consultantId: '' };
      this.poService.checkAssignedConsultantToPG(poIdValue).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response.body);
          if (response.body === true) {
            this.modalForDelete(index, pgId);
          } else if (response.body === false) {
            this.dialog.open(DeleteModalComponent, {
              panelClass: 'edit-modal',
              width: '590px',
              height: '270px',
              disableClose: true,
              data: Util.showModalMessages(Modules.PG, pgName, Messages.deletePoMessage)
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        },
      });
    } else {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.deletePg, Messages.deletePgHeading],
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.pgFormArray.removeAt(index);
        }
      });
    }
  }

  modalForDelete(index: any, pgId: string): void {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'edit-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.deletePg, Messages.deletePgHeading],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deletePgApi(this.poId, pgId);
        this.pgFormArray.removeAt(index);
      }
    });
  }

  deletePgApi(poId: string, pgId: string): void {
    this.poService.deletePgUnderPo(poId, pgId).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.toastr.success('PG deleted successfully');
          this.createPOForm.markAsDirty();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

  checkDuplicatePgName(control: AbstractControl): ValidationErrors | null {
    const formGroup = control.parent as FormGroup;
    const formArray = formGroup?.parent as FormArray;
    if (!formArray) {
      return null;
    }
    const isDuplicate = formArray.controls.some(
      (group) =>
        group.get('pgName')?.value === control.value && group !== formGroup
    );
    return isDuplicate ? { duplicate: true } : null;
  }

  async getPoByPoIdFromPoCollection(poId: string): Promise<any> {
    const response: HttpResponse<any> =
      await this.poService.getPoByPoIdFromPoCollection(poId);
    return response.body;
  }

  extractPoIdFromInjectedData(data: any): any {
    return data?.poId ?? null;
  }

  populateDateField() {
    const date = this.poDbData.poStartDate;
    if (date) {
      let formattedDate: any = moment(date, 'DD.MM.yyyy');
      this.createPOForm
        .get('poStartDate')
        ?.setValue(formattedDate, { emitEvent: false });
    }
  }

  convertDateTimeStringToDateTimeMomentObject(inputDate: any): any {
    if (inputDate) {
      let formattedDate: any = moment(inputDate, 'DD.MM.yyyy');
      return formattedDate;
    }
    return '';
  }

  async populateFormWithDataFromDb() {
    if (this.checkModeAsUpdate()) {
      this.poDbData = await this.getPoByPoIdFromPoCollection(this.poId);
      this.isRemoteAndOnsiteChecked = this.poDbData?.pgWithRemoteAndOnsite;
      let data = this.poDbData;
      setTimeout(() => {
        this.createPOForm.patchValue({
          id: data?.id,
          projectId: data?.projectId,
          clientId: data?.clientId,
          poNo: data?.poNo,
          poDate: data?.poDate,
          poStartDate: this.convertDateTimeStringToDateTimeMomentObject(
            data?.poStartDate
          ),
          poEndDate: this.convertDateTimeStringToDateTimeMomentObject(
            data?.poEndDate
          ),
          currency: data?.currency,
          notes: data?.notes,
          poTotalBudget: Util.convertNumberToLocalFormat(data?.poTotalBudget),
          status: data?.status,
          pgWithRemoteAndOnsite: data?.pgWithRemoteAndOnsite,
          poTimesheetTemplate: {
            templateId: data?.poTimesheetTemplate?.templateId,
            templateName: data?.poTimesheetTemplate?.templateName,
            url: data?.poTimesheetTemplate?.url,
            timesheetHeaderData: data?.poTimesheetTemplate?.timesheetHeaderData,
            status: data?.poTimesheetTemplate?.status,
            filename: data?.poTimesheetTemplate?.filename,
          },
          vcId: data?.vcId,
        });

        if (this.isRemoteAndOnsiteChecked) {
          this.poService.checkRemoteTimesheetEntry(this.poId).subscribe({
            next: (response: any) =>{
              if(response === true){
                this.hasRemoteTimesheet = true;
                this.createPOForm.get('pgWithRemoteAndOnsite')?.disable();
              }
            }, error: (err: any) =>{
              console.log(err);
            }
          });
        }

        this.selectedCurrency = this.getCurrencySymbol(data?.currency);
        // Set project value
        this.populateProjectClient(data.projectId, data.clientId);
        // Set template value
        this.populateTemplate(data.poTimesheetTemplate.templateId);
      }, 500);
    }
  }

  populateAbruf(abrufs: []) {
    abrufs?.forEach((abrufId: any, index: number) => {
      const abruf = this.filteredAbrufs.filter(
        (item: any) => item.id === abrufId
      );
      this.abrufs.at(index)?.get('abruf')?.setValue(abruf[0]);
      if (index < abrufs.length - 1) {
        this.addAbruf();
      }
    });
  }

  populateProjectClient(projectId: string, clientId: string) {
    const project = this.projectWithClients.filter(
      (item: any) => item.projectId === projectId && item.clientId === clientId
    );
    this.projectCtrl.setValue(project[0]);
  }

  populateTemplate(templateId: string) {
    const template = this.templates.filter(
      (item: any) => item.id === templateId
    );
    this.templateCtrl.setValue(template[0]);
    this.templateCtrl.valueChanges.subscribe(() => {
      this.createPOForm.markAsDirty();
    });
  }

  populateAbrufsAndPGs() {
    if (this.checkModeAsUpdate()) {
      this.populateAbruf(this.poDbData.abrufs);
      this.insertPgDataFromDb(this.poDbData);
    }
  }

  checkModeAsUpdate() {
    return !Util.strIsNullOrEmpty(this.poId);
  }

  insertPgDataFromDb(jsonData: any) {
    if (jsonData?.pgs && Array.isArray(jsonData.pgs)) {
      jsonData.pgs.forEach((pg: any) => {
        const pgFormGroup = this.createPgFormGroup();
        pgFormGroup.patchValue({
          pgName: pg.pgName ?? '',

          totalOnsiteHours: Util.convertNumberToLocalFormatInTimesheet(pg.totalOnsiteHours) ?? '',
          onsiteRate: Util.convertNumberToLocalFormatInTimesheet(pg.onsiteRate) ?? '',
          totalOnsiteBudget: Util.convertNumberToLocalFormat(pg.totalOnsiteBudget) ?? '',
          totalOnsiteDays: Util.convertNumberToLocalFormat(pg.totalOnsiteDays) ?? '',

          totalRemoteHours: Util.convertNumberToLocalFormatInTimesheet(pg.totalRemoteHours) ?? '',
          prevTotalRemoteHours: Util.convertNumberToLocalFormatInTimesheet(pg.totalRemoteHours) ?? '',

          remoteRate: Util.convertZeroValueForTotals(Util.convertNumberToLocalFormatInTimesheet(pg.remoteRate)) ?? '',
          prevRemoteRate: Util.convertZeroValueForTotals(Util.convertNumberToLocalFormatInTimesheet(pg.remoteRate)) ?? '',

          totalRemoteBudget: Util.convertNumberToLocalFormat(pg.totalRemoteBudget) ?? '',
          totalRemoteDays: Util.convertNumberToLocalFormat(pg.totalRemoteDays) ?? '',

          status: pg.status ?? '',
          pgId: pg.id ?? '',
          id: pg.id ?? ''
        });
        // Now patch pgConsultants into the FormArray
        const pgConsultantsArray = pgFormGroup.get('pgConsultants') as FormArray;
        pgConsultantsArray.clear(); // Clear the array before adding new data

        const newConsultants = pg.pgConsultants?.map((consultant: any) => this.fb.group({
          assignmentId: consultant.assignmentId ?? '',
          endDate: consultant.endDate ?? '',
          id: consultant.id ?? '',
          startDate: consultant.startDate ?? '',
          status: consultant.status ?? '',
        })) || [];
        pgConsultantsArray.controls = newConsultants;
        pgConsultantsArray.updateValueAndValidity();
        this.pgFormArray.push(pgFormGroup);
      });

      this.disableRemoteValues();
    }
  }

  isFormDirty(): boolean {
    return this.createPOForm.dirty;
  }

  isFormInvalid(): boolean {
    return this.createPOForm.invalid;
  }

  isPgsDirty(): boolean {
    return this.createPOForm.get('pgs')?.dirty ?? false;
  }

  isAbrufsDirty(): boolean {
    return this.createPOForm.get('abrufs')?.dirty ?? false;
  }

  isPgsInvalid(): boolean {
    return this.createPOForm.get('pgs')?.invalid ?? false;
  }
  isAbrufsInvalid(): boolean {
    return this.createPOForm.get('abrufs')?.invalid ?? false;
  }

  // handleKeyPressForDeletePg(event: KeyboardEvent, index: number): void {
  //   if (event.key === 'Enter' || event.key === ' ') {
  //     this.deletePg(index);
  //   }
  // }

  formatAndValidate(controlName: string): void {
    const control = this.createPOForm.get(controlName);
    const value = control?.value;
    console.log(control, value);

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

}
