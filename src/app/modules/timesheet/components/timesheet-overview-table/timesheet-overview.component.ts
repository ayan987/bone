import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActiveConsultant } from '../../../../models/timesheet-consultant';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, forkJoin, map, ReplaySubject, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ClientsService } from '../../../client/services/client/clients.service';
import { ProjectService } from '../../../project/services/project/project.service';
import { ClientProjectService } from '../../../shared/services/client-project/client-project.service';
import { FilterCriteria } from '../../../../models/active-consultant-filter';
import moment from 'moment';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { TimesheetGenerationResultDialogComponent } from '../timesheet-generation-result-dialog/timesheet-generation-result-dialog.component';
import { ViewTimesheetComponent } from '../view-timesheet/view-timesheet.component';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSelect } from '@angular/material/select';
import { TimesheetStatus } from '../../../../models/timesheet-status-enum';
import { GeneratedTimesheet } from '../../../../models/generated-timesheet';
import { SendEmailDialogComponent } from '../send-email-dialog/send-email-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ScrollTrackerDirective } from '../../../shared/directives/scroll-tracker.directive';
import { TimesheetTemplateService } from '../../../shared/services/timesheet-template/timesheet-template.service';
import { PoService } from '../../../shared/services/po/po.service';
import { TimesheetRegenerationResultDialogComponent } from '../timesheet-regeneration-result-dialog/timesheet-regeneration-result-dialog.component';
import { CheckUnmatchedImportsComponent } from '../check-unmatched-imports/check-unmatched-imports.component';
import { ViewUnmatchedImportComponent } from '../view-unmatched-import/view-unmatched-import.component';

// client.model.ts
export interface Client {
  id: string;
  shortName: string;
  legalName: string;
  status: string;
}

// project.model.ts
export interface Project {
  id: string;
  projectName: string;
  projectDescription: string;
  abrufRequired: boolean;
  status: string;
}

// relation.model.ts
export interface Relation {
  id: string;
  projectId: string;
  projectName: string;
  abrufRequired: boolean;
  clientId: string;
  shortName: string;
}


@Component({
  selector: 'app-timesheet-overview',
  templateUrl: './timesheet-overview.component.html',
  styleUrl: './timesheet-overview.component.scss'
})
export class TimesheetOverviewComponent {
  @Input() tableData: any[] = [];
  @Input() isGeneratedView: boolean = false;
  @Input() isUnmatchedView: boolean = false;
  @Input() tableHead: string = '';
  @Output() applyFiltersEvent = new EventEmitter<FilterCriteria>();
  @Input() unMatchTimesheetData: any;
  @Output() activeTab = new EventEmitter<any>();
  @Output() loadMoreData = new EventEmitter<any>();
  @Output() loadDataOnTimesheetDelete = new EventEmitter<any>();
  @ViewChild(ScrollTrackerDirective) scrollingFinished!: ScrollTrackerDirective;
  @ViewChild('clientSelection') clientSelection!: MatSelect;
  @ViewChild('projectSelection') projectSelection!: MatSelect;
  @ViewChild('statusSelection') statusSelection!: MatSelect;
  @ViewChild('emailStatusSelection') emailStatusSelection!: MatSelect;

  error = TimesheetStatus.error;
  genqueued = TimesheetStatus.genqueued;
  emailqueued = TimesheetStatus.emailqueued;
  started = TimesheetStatus.started;
  generated = TimesheetStatus.generated;
  imported = TimesheetStatus.imported;
  notneeded = TimesheetStatus.notneeded;
  tsdeleted = TimesheetStatus.tsdeleted;
  sent = TimesheetStatus.sent;
  actionItemSelected: string = '';

  displayedColumns: string[] = this.getDisplayedColumns();
  // displayedColumns: string[] = (this.isGeneratedView || this.isUnmatchedView) ?
  // [
  //   'select',
  //   'client',
  //   'project',
  //   'abruf',
  //   'consultant',
  //   'poNumber',
  //   'priceGroup',
  //   'timesheetStatus',
  //   'emailStatus',
  //   'monthYear',
  // ] :
  // [
  //   'select',
  //   'client',
  //   'project',
  //   'abruf',
  //   'consultant',
  //   'poNumber',
  //   'priceGroup',
  //   'monthYear'];
  statusesGoodNames = [
    "TS Generated",
    "TS Generation Error",
    "E-Mail Sent",
    "E-Mail Failed",
    "TS Imported",
    "TS Import Failed",     // note: doesn’t exist in your source, will simply be skipped
    "1st Approval",
    "2nd Approval",
    "TS Sent To Client",
    "Rejected"
  ];

  dataSource: ActiveConsultant[] = [];

  selectedMonthYear: string = '';

  selection = new SelectionModel<ActiveConsultant>(true, []);
    selectedRow: any = null;

  // For client filter
  clientFilterCtrl: FormControl = new FormControl();
  clientMultiFilterCtrl: FormControl = new FormControl();
  filteredClients: ReplaySubject<Client[]> = new ReplaySubject<Client[]>(1);

  clients: Client[] = [];

  // For project filter
  projectFilterCtrl: FormControl = new FormControl();
  projectMultiFilterCtrl: FormControl = new FormControl();
  filteredProjects: ReplaySubject<Project[]> = new ReplaySubject<Project[]>(1);

  projects: Project[] = [];

  statuses = [];

  // For status filter
  statusFilterCtrl: FormControl = new FormControl();
  statusMultiFilterCtrl: FormControl = new FormControl();
  filteredStatuses: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  // For email status filter
  emailStatusFilterCtrl: FormControl = new FormControl();
  emailStatusMultiFilterCtrl: FormControl = new FormControl();
  emailFilteredStatuses: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);

  ORIGINAL_DATA_SOURCE: ActiveConsultant[] = [];

  clientWithProject: any[] = [];

  protected _onDestroy = new Subject<void>();
  consultantSearchCtrl: FormControl = new FormControl();
  pgSearchCtrl: FormControl = new FormControl();
  poSearchCtrl: FormControl = new FormControl();
  abrufSearchCtrl: FormControl = new FormControl();
  isLoading = false;
  selectedYear: string = '';
  selectedMonth: string = '';
  @ViewChild(ViewTimesheetComponent) viewTimesheetComponent!: ViewTimesheetComponent;
  @ViewChild('sideBar') sideBar!: MatDrawer;
  timesheetRowData?: GeneratedTimesheet;
  noTemplateText = 'PO has no template assigned. Generation of timesheet for this entry is not possible.';
  clipboardTooltip = "Copy to clipboard";

  constructor(private clientService: ClientsService, private projectService: ProjectService,
              private clientProjectService: ClientProjectService,
              private dialog: MatDialog, private timesheetService: TimesheetService,
              private toastr: ToastrService,
                  private readonly timesheetTemplateService: TimesheetTemplateService,
                  private readonly poService: PoService,public dialogRefViewUnmatched: MatDialogRef<ViewUnmatchedImportComponent> ) { }

  ngOnInit() {
    this.getAllTimesheetStatusTemplates();
    this.selectedMonthYear = this.getCurrentMonth();
    this.selectedMonth = this.selectedMonthYear.split('-')[1];
    this.selectedYear = this.selectedMonthYear.split('-')[0];
    // Clone original data source
    const filterCriteria: FilterCriteria = {};
    if (!this.isGeneratedView) {
      filterCriteria.month = parseInt(this.selectedMonthYear.split('-')[1], 10);
      filterCriteria.year = parseInt(this.selectedMonthYear.split('-')[0], 10);
    }

    this.getAllClientList();
    this.getAllProjectList();
    this.getAssociatedClientProject();

    this.prepareValueChanges();
  }

  ngOnChanges() {
    this.displayedColumns = this.getDisplayedColumns();
    this.ORIGINAL_DATA_SOURCE = this.tableData;
    this.dataSource = this.tableData.slice();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  // Method to handle the matching of the timesheet
  matchTimesheet(row: any): void {
    const requestObj = {
      unMatchedData: this.unMatchTimesheetData,
      matchedData: [row]
    };
    let dialogRef = this.dialog.open(CheckUnmatchedImportsComponent, {
      width: '1700px',
      height: '480px',
      disableClose: true,
      data: requestObj
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.matchDataApiCall(requestObj)
      } else {
        dialogRef.close(false);
      }
    });
  }

  matchDataApiCall(requestObj: any): void {
    const matchedData = requestObj.matchedData[0];
    const unMatchedData = requestObj.unMatchedData[0];
    this.timesheetService.getImportTimesheetById(unMatchedData.id).subscribe({
      next: (response: any) => {
        if(response.status === 200){
          const importTimesheetData = response.body;
          importTimesheetData.Checksum = matchedData.id;
          const filteredImportedData = this.prepareImportJsonData(importTimesheetData);
          const importedBy = JSON.parse(localStorage.getItem('loggedInUser')??"") ?? '';
          this.timesheetService.importGeneratedTimesheet(filteredImportedData, false, importedBy).subscribe({
            next: () => {
              if(response.status === 200){
                this.timesheetService.deleteImportTimesheetById(unMatchedData.id).subscribe({
                  next: (response: any) => {
                    if(response.status === 204){
                      this.dialogRefViewUnmatched.close(true);
                      this.toastr.success("Timesheet matched successfully");
                    }
                  },
                  error: (err: any) => {
                    console.log(err);
                  }
                });
              }
            },
            error: (err: any) => {
              console.log(err);
            }
          })
          console.log('imported data updated',importTimesheetData)
        }
      },
      error: (err: any) =>{
        console.log(err);
      }
      });
  }

  prepareImportJsonData(importedData: any) {
    const {
      id,
      importHistory,
      mappedData,
      statusDatetime,
      statusHistory,
      currentStatus,
      ...filteredImportedData
    } = importedData;

    return filteredImportedData;
  }

  // Method to determine which columns to display based on the current view
  private getDisplayedColumns(): string[] {
    if (this.isGeneratedView) {
      return [
        'select',
        'client',
        'project',
        'abruf',
        'consultant',
        'poNumber',
        'priceGroup',
        'status',
        // 'timesheetStatus',
        // 'emailStatus',
        'monthYear',
      ];
    } else if (this.isUnmatchedView) {
      return [
        'selectUnmatched',
        'client',
        'project',
        'abruf',
        'consultant',
        'poNumber',
        'priceGroup',
        'status',
        // 'timesheetStatus',
        // 'emailStatus',
        // 'monthYear',
      ];
    } else {
      // Default view
      return [
        'select',
        'client',
        'project',
        'abruf',
        'consultant',
        'poNumber',
        'priceGroup',
        'monthYear'
      ];
    }
  }

  getAllTimesheetStatusTemplates(): void {
    this.timesheetService.getAllTimesheetStatusTemplates().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          // this.statuses = response.body;
          this.statuses = response.body.filter((s: any) =>
            this.statusesGoodNames.includes(s.statusGoodName)
          );
          this.filteredStatuses.next(this.statuses.slice());
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  getCurrentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    let month: number | string = today.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }

    return `${year}-${month}`;
  }

  getAllClientList(): void {
    this.clientService.getAllClients().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.clients = response.body.filter((client: any) => client.status === 'ACTIVE');
          this.filteredClients.next(this.clients.slice());
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  getAllProjectList(): void {
    this.projectService.getProjects().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.projects = response.body.filter((project: any) => project.status === 'ACTIVE');
          this.filteredProjects.next(this.projects.slice());
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  getAssociatedClientProject(): void {
    this.clientProjectService.getAssociatedClientProject().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.clientWithProject = response.body.filter((projectClient: any) => projectClient.status === 'ACTIVE');
          this.initializeFilters();
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  initializeFilters() {
    this.updateProjects();
  }

  private updateProjects() {
    const selectedClientIds: string[] = this.clientFilterCtrl.value || [];

    if (selectedClientIds.length === 0) {
      // If no clients selected, show all projects
      this.filteredProjects.next(this.projects.slice());
      return;
    }

    // Find projects related to the selected clients
    const relatedProjectIds = this.clientWithProject
      .filter(relation => selectedClientIds.includes(relation.clientId))
      .map(relation => relation.projectId);

    // Get unique project IDs
    const uniqueProjectIds = Array.from(new Set(relatedProjectIds));

    // Filter projects based on the related project IDs
    const filteredProjects = this.projects.filter(project => uniqueProjectIds.includes(project.id));

    // Update the filtered projects
    this.filteredProjects.next(filteredProjects);

    // Reset project selection
    this.projectFilterCtrl.setValue([]);
  }

  clearSearch(type: string) {
    if (type === 'consultant') {
      this.consultantSearchCtrl.setValue('');
    } else if (type === 'pg') {
      this.pgSearchCtrl.setValue('');
    } else if (type === 'po') {
      this.poSearchCtrl.setValue('');
    } else if (type === 'abruf') {
      this.abrufSearchCtrl.setValue('');
    }
  }

  private filterClients(): void {
    let filtered = [...this.clients];

    // Filter by *selected projects*
    const selectedProjectIds: string[] = this.projectFilterCtrl.value || [];
    if (selectedProjectIds.length > 0) {
      // Gather all client IDs linked to those projects
      const relatedClientIds = this.clientWithProject
        .filter((relation) => selectedProjectIds.includes(relation.projectId))
        .map((relation) => relation.clientId);

      const uniqueClientIds = Array.from(new Set(relatedClientIds));
      filtered = filtered.filter((client) => uniqueClientIds.includes(client.id));
    }

    // Filter by *search text* in the client filter input
    const searchText = (this.clientMultiFilterCtrl.value || '').trim().toLowerCase();
    if (searchText) {
      filtered = filtered.filter((client) =>
        client.shortName.toLowerCase().includes(searchText)
      );
    }

    // Emit final array
    this.filteredClients.next(filtered);
  }

  private filterProjects(): void {
    let filtered = [...this.projects];

    // Filter by *selected clients*
    const selectedClientIds: string[] = this.clientFilterCtrl.value || [];
    if (selectedClientIds.length > 0) {
      // Gather all project IDs linked to those clients
      const relatedProjectIds = this.clientWithProject
        .filter((relation) => selectedClientIds.includes(relation.clientId))
        .map((relation) => relation.projectId);

      const uniqueProjectIds = Array.from(new Set(relatedProjectIds));
      filtered = filtered.filter((project) => uniqueProjectIds.includes(project.id));
    }

    // Filter by *search text* in the project filter input
    const searchText = (this.projectMultiFilterCtrl.value || '').trim().toLowerCase();
    if (searchText) {
      filtered = filtered.filter((project) =>
        project.projectName.toLowerCase().includes(searchText)
      );
    }

    //  Emit final array
    this.filteredProjects.next(filtered);
  }


  private filterStatuses() {
    if (!this.statuses) {
      return;
    }
    // Get the search keyword
    let search = this.statusMultiFilterCtrl.value;
    if (!search) {
      this.filteredStatuses.next(this.statuses.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // Filter the projects
    this.filteredStatuses.next(
      this.statuses.filter((status: any) => status.statusGoodName.toLowerCase().indexOf(search) > -1)
    );
  }

  applyFilters() {
    this.clientSelection.close();
    this.projectSelection.close();
    if (this.isGeneratedView) {
      this.statusSelection.close();
      // this.emailStatusSelection.close();
    }
    const filterCriteria: FilterCriteria = {};

    // Client Short Names
    if (this.clientFilterCtrl.value && this.clientFilterCtrl.value.length > 0) {
      filterCriteria.clientShortName = this.getClientShortNames(this.clientFilterCtrl.value);
    }

    // Project Names
    if (this.projectFilterCtrl.value && this.projectFilterCtrl.value.length > 0) {
      filterCriteria.projectName = this.getProjectNames(this.projectFilterCtrl.value);
    }

    // Abruf Search
    if (this.abrufSearchCtrl.value && this.abrufSearchCtrl.value.length > 0) {
      filterCriteria.abrufNo = this.abrufSearchCtrl.value.trim();
    }

    // Consultant Name
    if (this.consultantSearchCtrl.value && this.consultantSearchCtrl.value.length > 0) {
      const names = this.consultantSearchCtrl.value.trim().split(' ');
      if (names.length > 1) {
        // If there's at least one space, assign first and last names accordingly
        filterCriteria.firstName = names[0];
        filterCriteria.lastName = names.slice(1).join(' ');
      } else {
        // If there's no space, assign the input to firstName
        filterCriteria.firstName = names[0];
      }
    }

    // PO Number
    if (this.poSearchCtrl.value && this.poSearchCtrl.value.length > 0) {
      filterCriteria.poNo = this.poSearchCtrl.value.trim();
    }

    // Price Group Name
    if (this.pgSearchCtrl.value && this.pgSearchCtrl.value.length > 0) {
      filterCriteria.pgName = this.pgSearchCtrl.value.trim();
    }

    // Timesheet Statuses
    if (this.statusFilterCtrl.value && this.statusFilterCtrl.value.length > 0) {
      filterCriteria.tsGenerationStatus = this.statusFilterCtrl.value.map((status: any) => status.statusKey);
    }

    // Email Statuses
    // if (this.emailStatusFilterCtrl.value && this.emailStatusFilterCtrl.value.length > 0) {
    //   filterCriteria.emailGenerationStatus = this.emailStatusFilterCtrl.value;
    // }

    const inputElement = document.getElementById('start') as HTMLInputElement;
    let inputValue = inputElement?.value;

    // If it's empty, we set it to the current month and year.
    if (!inputValue && !this.isGeneratedView && !this.isUnmatchedView) {
      const currentDate = moment();
      inputValue = currentDate.format('YYYY-MM');
      inputElement.value = inputValue;
    }
    if(!this.isUnmatchedView){[this.selectedYear, this.selectedMonth] = inputValue.split('-'); }


    // Month and Year
    if (this.selectedYear && this.selectedMonth) {
      filterCriteria.month = parseInt(this.selectedMonth, 10);
      filterCriteria.year = parseInt(this.selectedYear, 10);
    }
    this.selection.clear();
    this.applyFiltersEvent.emit(filterCriteria);

  }

  getClientShortNames(clientIds: string[]): string[] {
    return this.clients
      .filter(client => clientIds.includes(client.id))
      .map(client => client.shortName);
  }

  getProjectNames(projectIds: string[]): string[] {
    return this.projects
      .filter(project => projectIds.includes(project.id))
      .map(project => project.projectName);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: ActiveConsultant): string {
    if (!row) {
      return `${this.isAllSelected() ? 'Deselect' : 'Select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'Deselect' : 'Select'} row`;
  }

  openGenerationConfirmation() {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.confirmGeneration, 'Confirmation'],
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.generateTimesheets();
        } else {
          dialogRef.close();
        }
      });
  }

  generateTimesheets(): void {
    this.isLoading = true;
    const request = this.prepareDataForGeneration();
    this.timesheetService.generateTimesheets(request, false).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.isLoading = false;
          console.log('Timesheets generated successfully');
          this.openTimesheetResultDialog(response.body);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  openTimesheetResultDialog(data: any): void {
    data.selectedConsultants = this.selection.selected.length;
    const dialogRef = this.dialog.open(TimesheetGenerationResultDialogComponent, {
      width: data.notSavedEntries?.length > 0 ? '900px' : '600px',
      maxHeight: '700px',
      data: data // e.g. { savedEntriesCount: 0, notSavedEntries: [...], ... }
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.selection.clear();
      if (result) {
        this.activeTab.emit(1);
      }
    });
  }

  prepareDataForGeneration(): any {
    // const selectedIds = this.selection.selected.map(item => item.id);
    this.selection.selected.forEach((item: any) => {
      item.poId = item.id ?? '';
      item.timesheetGeneratedBy = JSON.parse(localStorage.getItem('loggedInUser')??"") ?? '';
    });
    const selectedConsultants = this.selection.selected;
    const requestPayload = {
      activeConsultants: selectedConsultants,
      month: Number(this.selectedMonth),
      year: Number(this.selectedYear)
    };
    return requestPayload;
  }

  sendEmail() {
    // Check if there is any selected item that does not have generationStatus "GENERATED"
    const nonGeneratedItems = this.selection.selected.filter(
      (item: any) => item.generationStatus !== this.generated
    );

    if (nonGeneratedItems.length > 0) {
      this.actionItemSelected = '';
      this.toastr.error('Please select only generated timesheets for sending emails.');
      return;
    }
    const dialogRef = this.dialog.open(SendEmailDialogComponent, {
      width: '1500px',
      // height: '700px',
      disableClose: true,
      data: this.selection.selected
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selection.clear();
        this.applyFilters();
      }
      this.actionItemSelected = '';
    });
  }

  formatMonthYear(month: string | number, year: string | number): string {
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    const date = moment({ year: yearNumber, month: monthNumber - 1 });
    return date.format('MMM-YY');
  }

  //----------------------View timesheet entries------------------------------------------
  viewTimesheetDetails(rowData: any, tabName: string): void{
    if (tabName === 'View Timesheets'){
      // this.selection.toggle(rowData);
      this.timesheetRowData = rowData;
      this.sideBar.open();

    } else {
      // this.selection.toggle(rowData);
    }
  }

  closeNavBar(event:any): void {
    this.sideBar.toggle();
    if (event){
      this.loadDataOnTimesheetDelete.emit();
      this.selection.clear();
    }
  }

  prepareValueChanges() {

    // Listen for client search field value changes
    this.clientMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterClients();
        this.filterProjects();
      });

    // Listen for project search field value changes
    this.projectMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProjects();
        this.filterClients();
      });

    // Listen for status field value changes
    this.statusMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStatuses();
      });

    // Listen for consultant field value changes
    this.consultantSearchCtrl.valueChanges
      .pipe(
        debounceTime(1000), // Wait for 1 second after the user stops typing
        distinctUntilChanged(),
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Price Group Search with Debounce
    this.pgSearchCtrl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // PO Number Search with Debounce
    this.poSearchCtrl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Abruf Search with Debounce
    this.abrufSearchCtrl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  onScrollingDataLoad() {
    this.loadMoreData.emit();
    this.scrollingFinished.resetEightyPercentGuard();
  }

  //----------------------Regeneration bulk------------------------------------------
  openRegenerationConfirmation(): void {
    const inputElement = document.getElementById('start') as HTMLInputElement;
    let inputValue = inputElement?.value;
    if(!inputValue){
      this.actionItemSelected = '';
      this.toastr.error('Please select a month and year for regeneration.');
    } else {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.confirmRegeneration, 'Confirmation'],
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.startRegenarationOfTimesheets();
        } else {
          dialogRef.close();
        }
      });
    }
  }

  startRegenarationOfTimesheets() {
    // 1) build ActiveConsultant shells from your selection
    const monthNum = Number(this.selectedMonth),
          yearNum  = Number(this.selectedYear);
    let consultantBeforeFilter = this.selection.selected;
    const validRegenerationConsultant = this.selection.selected.filter((item: any) => (item.generationStatus === this.generated || item.generationStatus === this.error || item.generationStatus === this.tsdeleted));
    this.noRegenerationPossibleModal(consultantBeforeFilter,validRegenerationConsultant);

    const shells: ActiveConsultant[] = validRegenerationConsultant.map(item =>
      this.destructureDataWithActiveConsultant(item as GeneratedTimesheet)
    );
    // 2) for each shell, create an Observable that will load PO → template → project
    const enrich$ = shells.map(consultant =>
      this.poService.getPoDetailsById(consultant.poId!).pipe(
        filter(res => res.status === 200),
        tap(res => {consultant.vcId = res.body?.vcId ?? ''}),
        switchMap(() =>
          this.timesheetTemplateService.getTemplateById(consultant.poTimesheetTemplateId!)
        ),
        filter(res => res.status === 200),
        tap((res: any) => {
          consultant.poTimesheetTemplateHeaderData = res.body.timesheetHeaderData;
          consultant.poTimesheetTemplateFileName   = res.body.filename;
          consultant.poTimesheetTemplateName       = res.body.templateName;
        }),
        switchMap(() =>
          this.projectService.getProjectById(consultant.projectId!)
        ),
        filter(res => res.status === 200),
        tap((res: any) => {
          consultant.endClientName  = res.body.endClients.name;
          consultant.resPersonId    = res.body.responsiblePerson.id;
          consultant.resPersonName  =
            res.body.responsiblePerson.firstName + ' '
            + res.body.responsiblePerson.lastName;
        }),
        // finally emit the enriched consultant
        map(() => consultant)
      )
    );

    // 3) wait until every consultant‑observable completes
    forkJoin(enrich$).pipe(
      switchMap(enriched => {
        // now every consultant has all required fields
        const payload = { activeConsultants: enriched, month: monthNum, year: yearNum };
        return this.timesheetService.generateTimesheets(payload, true);
      })
    ).subscribe({
      next: resp => {
        if (resp.status === 200) {
          this.isLoading = false;
          this.loadDataOnTimesheetDelete.emit();
          this.selection.clear();
          console.log('Timesheets regenerated successfully for all consultants');
        }
      },
      error: err => {
        this.isLoading = false;
        console.error('Failed to regenerate timesheets', err);
      }
    });
  }

  noRegenerationPossibleModal(allConsultantData: any, validConsultant: any): void{
    const data = {
      savedConsultants: validConsultant,
      notSavedEntries: allConsultantData.filter((item: any) => item.generationStatus !== this.generated && item.generationStatus !== this.error && item.generationStatus !== this.tsdeleted),
      selectedConsultants: allConsultantData
    };
    const dialogRef = this.dialog.open(TimesheetRegenerationResultDialogComponent, {
      width: '900px',
      maxHeight: '700px',
      data: data
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.selection.clear();
      this.actionItemSelected = '';
      if (result) {
        this.activeTab.emit(2);
      }
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
}
