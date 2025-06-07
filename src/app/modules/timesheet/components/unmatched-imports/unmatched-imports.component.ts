import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { debounceTime, merge, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { Project } from '../timesheet-overview-table/timesheet-overview.component';
import { FilterCriteria } from '../../../../models/active-consultant-filter';
import moment from 'moment';
import { ProjectService } from '../../../project/services/project/project.service';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { ViewUnmatchedImportComponent } from '../view-unmatched-import/view-unmatched-import.component';
import { MatDialog } from '@angular/material/dialog';
import { Util } from '../../../../libraries/Util';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-unmatched-imports',
  templateUrl: './unmatched-imports.component.html',
  styleUrl: './unmatched-imports.component.scss'
})
export class UnmatchedImportsComponent implements OnInit, OnDestroy {
  util = new Util();
  consultantSearchCtrl: FormControl = new FormControl();
  poSearchCtrl: FormControl = new FormControl();
  abrufSearchCtrl: FormControl = new FormControl();
  hoursSearchCtrl: FormControl = new FormControl();

  @ViewChild('clientSelection') clientSelection!: MatSelect;
  @ViewChild('projectSelection') projectSelection!: MatSelect;
  @ViewChild('statusSelection') statusSelection!: MatSelect;
  @ViewChild('emailStatusSelection') emailStatusSelection!: MatSelect;
  protected _onDestroy = new Subject<void>();

  displayedColumns: string[] =
  [
    'project',
    'abruf',
    'consultant',
    'poNumber',
    'hours',
    'importDate',
    'monthYear'
  ];
  dataSource = new MatTableDataSource<any>([]);

  // For project filter
  projects: Project[] = [];
  projectFilterCtrl: FormControl = new FormControl();
  projectMultiFilterCtrl: FormControl = new FormControl();
  filteredProjects: ReplaySubject<Project[]> = new ReplaySubject<Project[]>(1);
  selectedMonthYear: string = '';

  constructor(private readonly projectService: ProjectService, private readonly importService: TimesheetService, public dialog: MatDialog,){}

  ngOnInit(): void {
    this.getAllProjectList();
    this.getAllUntachedImports();
    this.predicateJsonMattable();

    this.projectMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProjects();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

    /** Predicate For Mat Table filter to the data */
  predicateJsonMattable(): void {
      this.dataSource.filterPredicate = (row: any, filterJson: string) => {
      const filterData: any = JSON.parse(filterJson);
      const mappedData = row?.mappedData ?? {};

      // Project name (exact match from dropdown list)
      if (filterData.projectName?.length > 0 && !filterData.projectName.includes(mappedData?.projectName)) {
        return false;
      }

      // Abruf No (partial match, case-insensitive)
      if (filterData.abrufName && !(String(mappedData?.abrufNo ?? '').toLowerCase().includes(filterData.abrufName.toLowerCase()))) {
        return false;
      }

      // Consultant Name
      if (filterData.firstName && !(String(mappedData?.consultantName ?? '').toLowerCase().includes(filterData.firstName.toLowerCase()))) {
        return false;
      }

      // PO Number
      if (filterData.poNo && !(String(mappedData?.poNo ?? '').toLowerCase().includes(filterData.poNo.toLowerCase()))) {
        return false;
      }

      // Hours (exact match)
      if (filterData.hours) {
        const expected = +filterData.hours;
        const onsite = +mappedData?.totalOnsiteHours || 0;
        const remote = +mappedData?.totalRemoteHours || 0;
        const total = mappedData?.totalHours != null ? +mappedData.totalHours : onsite + remote;
        if (expected !== total) {
          return false;
        }
      }

      // Import Date — comparing against row.statusDatetime (ISO)
      if (filterData.importDate) {
        const [year, month] = filterData.importDate.split('-').map(Number);
        const rowDate = new Date(row.statusDatetime);
        if (rowDate.getFullYear() !== year || rowDate.getMonth() + 1 !== month) {
          return false;
        }
      }

      // Month-Year from mappedData.reportMonth (supports "MMMM YYYY" and fallback to "DD.MM.YYYY")
      if (filterData.monthYear && mappedData?.reportMonth) {
        const [fYear, fMonth] = filterData.monthYear.split('-').map(Number);
        const parsed = moment(mappedData.reportMonth, ['MMMM YYYY', 'DD.MM.YYYY', 'YYYY-MM-DD']);
        if (!parsed.isValid() || parsed.year() !== fYear || parsed.month() + 1 !== fMonth) {
          return false;
        }
      }

      return true;
    };

    // whenever any filter input changes:
    merge(
      this.projectFilterCtrl.valueChanges,
      this.abrufSearchCtrl.valueChanges,
      this.consultantSearchCtrl.valueChanges,
      this.poSearchCtrl.valueChanges,
      this.hoursSearchCtrl.valueChanges,
    ).pipe(debounceTime(200)).subscribe(() => this.applyFilters());
  }

  /** Get all unmatched imported timesheet */
  getAllUntachedImports(): void {
    this.importService.getAllUnmatchedImportedTimesheet().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.dataSource.data = response.body;
          this.predicateJsonMattable();
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  viewUnmatchedTimesheetDetails(rowData: any): void{
    let dialogRef = this.dialog.open(ViewUnmatchedImportComponent, {
      width: '1700px',
      height: '750px',
      disableClose: true,
      data: [rowData]
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getAllUntachedImports();
        this.getAllProjectList();
      }
    });
  }

  /** Clear the search */
  clearSearch(type: string) {
    if (type === 'consultant') {
      this.consultantSearchCtrl.setValue('');
    } else if (type === 'hours') {
      this.hoursSearchCtrl.setValue('');
    } else if (type === 'po') {
      this.poSearchCtrl.setValue('');
    } else if (type === 'abruf') {
      this.abrufSearchCtrl.setValue('');
    }
  }

  /** Get all projects */
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

  /** Get all filtered projects */
  private filterProjects(): void {
    let filtered = [...this.projects];

    const searchText = (this.projectMultiFilterCtrl.value ?? '').trim().toLowerCase();
    if (searchText) {
      filtered = filtered.filter((project) =>
        project.projectName.toLowerCase().includes(searchText)
      );
    }

    //  Emit final array
    this.filteredProjects.next(filtered);
  }

  /** Get the project name */
  getProjectNames(projectIds: string[]): string[] {
    return this.projects
      .filter(project => projectIds.includes(project.id))
      .map(project => project.projectName);
  }

  /** Apply filter to the data */
  applyFilters(): void {
    this.projectSelection.close();
    const filterCriteria: FilterCriteria = {};

    // Project Names
    if (this.projectFilterCtrl.value && this.projectFilterCtrl.value.length > 0) {
      filterCriteria.projectName = this.getProjectNames(this.projectFilterCtrl.value);
    }

    // Abruf Search
    if (this.abrufSearchCtrl.value && this.abrufSearchCtrl.value.length > 0) {
      filterCriteria.abrufName = this.abrufSearchCtrl.value.trim();
    }

    // Consultant Name
    if (this.consultantSearchCtrl.value && this.consultantSearchCtrl.value.length > 0) {
      filterCriteria.firstName = this.consultantSearchCtrl.value.trim();
    }

    // PO Number
    if (this.poSearchCtrl.value && this.poSearchCtrl.value.length > 0) {
      filterCriteria.poNo = this.poSearchCtrl.value.trim();
    }

    // PO Number
    if (this.hoursSearchCtrl.value && this.hoursSearchCtrl.value.length > 0) {
      filterCriteria.hours = this.hoursSearchCtrl.value.trim();
    }

    // Import Date
    const inputElement = document.getElementById('importDate') as HTMLInputElement;
    let inputValue = inputElement?.value;
    filterCriteria.importDate = inputValue;

    // Month Year
    const inputElementMonthYear = document.getElementById('monthYear') as HTMLInputElement;
    let inputValue2 = inputElementMonthYear?.value;
    filterCriteria.monthYear = inputValue2;

    // this.dataSource.filter = JSON.stringify(filterCriteria);
    this.dataSource.filter = JSON.stringify({ ...filterCriteria, _ts: Date.now() });

    // console.log('dataSource', this.dataSource.filteredData);
  }



  /** Format the month and year */
  formatMonthYear(month: string | number, year: string | number): string {
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    const date = moment({ year: yearNumber, month: monthNumber - 1 });
    return date.format('MMM-YY');
  }

  /** Return the display-string for “hours” (either totalHours or onsite+remote) */
  getHoursString(element: any): string {
    const m = element.mappedData;
    // prefer totalHours if present, otherwise sum onsite+remote
    const h =
      m.totalHours != null
        ? (m.totalHours ?? 0)
        : (m.totalOnsiteHours ?? 0) + (m.totalRemoteHours ?? 0);
    return h.toString();
  }
}
