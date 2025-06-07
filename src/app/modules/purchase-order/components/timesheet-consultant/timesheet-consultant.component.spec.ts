import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetConsultantComponent } from './timesheet-consultant.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { ColumnData } from '../../models/columnData';

describe('TimesheetConsultantComponent', () => {
  let component: TimesheetConsultantComponent;
  let fixture: ComponentFixture<TimesheetConsultantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetConsultantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimesheetConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
describe('TimesheetConsultantComponent', () => {
  let component: TimesheetConsultantComponent;
  let fixture: ComponentFixture<TimesheetConsultantComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockTimesheetService: jasmine.SpyObj<TimesheetService>;

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockTimesheetService = jasmine.createSpyObj('TimesheetService', ['getConsultantsByPOAndPgId', 'getConsultantsByPOIdPgIdMonthAndYear']);

    await TestBed.configureTestingModule({
      declarations: [TimesheetConsultantComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: ToastrService, useValue: mockToastr },
        { provide: TimesheetService, useValue: mockTimesheetService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate table with data', () => {
    const data = [
      {
        firstName: 'John',
        lastName: 'Doe',
        startDate: '2022-01-01',
        endDate: '2022-01-31',
        assignmentId: '123',
        onsiteHrs: 10,
        remoteHrs: 20,
        totalHrs: 30
      }
    ];

    component.populateTableWithData(data);

    expect(component.dataSource.length).toBe(1);
    expect(component.dataSource[0].name).toBe('John Doe');
    expect(component.dataSource[0].startDate).toBe('2022-01-01');
    expect(component.dataSource[0].endDate).toBe('2022-01-31');
    expect(component.dataSource[0].assignmentId).toBe('123');
    expect(component.dataSource[0].columns.column1.onsiteHrs).toBe(0);
    expect(component.dataSource[0].columns.column1.remoteHrs).toBe(0);
    expect(component.dataSource[0].columns.column1.totalHrs).toBe(0);
  });

  it('should fetch consultant data for columns', () => {
    const columns = ['January 2022', 'February 2022', '', ''];
    spyOn(component, 'getConsultantsByPOIdPgIdMonthAndYear');

    component.fetchConsultantDataForColumns(columns);

    expect(component.getConsultantsByPOIdPgIdMonthAndYear).toHaveBeenCalledTimes(2);
    expect(component.getConsultantsByPOIdPgIdMonthAndYear).toHaveBeenCalledWith(1, 2022, 0);
    expect(component.getConsultantsByPOIdPgIdMonthAndYear).toHaveBeenCalledWith(2, 2022, 1);
  });

  it('should calculate total onsite hours for column 4', () => {
    component.dataSource = [
      {
        columns: {
          column4: { onsiteHrs: 10, remoteHrs: 20, totalHrs: 30 },
          column1: {} as ColumnData,
          column2: {} as ColumnData,
          column3: {} as ColumnData
        },
        name: '',
        startDate: '',
        endDate: null,
        assignmentId: ''
      },
      {
        columns: {
          column4: { onsiteHrs: 5, remoteHrs: 15, totalHrs: 20 },
          column1: {} as ColumnData,
          column2: {} as ColumnData,
          column3: {} as ColumnData
        },
        name: '',
        startDate: '',
        endDate: null,
        assignmentId: ''
      }
    ];

    const totalOnsiteHours = component.calculateTotalOnsiteHoursColumn4();

    expect(totalOnsiteHours).toBe(15);
  });

  it('should calculate total remote hours for column 4', () => {
    component.dataSource = [
      {
        columns: {
          column4: { onsiteHrs: 10, remoteHrs: 20, totalHrs: 30 },
          column1: {} as ColumnData,
          column2: {} as ColumnData,
          column3: {} as ColumnData
        },
        name: '',
        startDate: '',
        endDate: null,
        assignmentId: ''
      },
      {
        columns: {
          column4: { onsiteHrs: 5, remoteHrs: 15, totalHrs: 20 },
          column1: {} as ColumnData,
          column2: {} as ColumnData,
          column3: {} as ColumnData
        },
        name: '',
        startDate: '',
        endDate: null,
        assignmentId: ''
      }
    ];

    const totalRemoteHours = component.calculateTotalRemoteHoursColumn4();

    expect(totalRemoteHours).toBe(35);
  });

  it('should calculate total hours for column 4', () => {
    component.dataSource = [
      {
        columns: {
          column4: { onsiteHrs: 10, remoteHrs: 20, totalHrs: 30 },
          column1: {} as ColumnData,
          column2: {} as ColumnData,
          column3: {} as ColumnData
        },
        name: '',
        startDate: '',
        endDate: null,
        assignmentId: ''
      },
      {
        columns: {
          column4: { onsiteHrs: 5, remoteHrs: 15, totalHrs: 20 },
          column1: {} as ColumnData,
          column2: {} as ColumnData,
          column3: {} as ColumnData
        },
        name: '',
        startDate: '',
        endDate: null,
        assignmentId: ''
      }
    ];

    const totalHours = component.calculateTotalHoursColumn4();

    expect(totalHours).toBe(50);
  });
});
