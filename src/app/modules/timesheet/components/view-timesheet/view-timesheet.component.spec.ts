import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewTimesheetComponent } from './view-timesheet.component';
import { TimesheetService } from '../../services/timesheet/timesheet.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { TimesheetTemplateService } from '../../../shared/services/timesheet-template/timesheet-template.service';
import { PoService } from '../../../shared/services/po/po.service';
import { ProjectService } from '../../../project/services/project/project.service';
import { ConsultantService } from '../../../shared/services/consultant/consultant.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TimesheetStatus } from '../../../../models/timesheet-status-enum';
import { GeneratedTimesheet } from '../../../../models/generated-timesheet';
import { By } from '@angular/platform-browser';

describe('ViewTimesheetComponent', () => {
  let component: ViewTimesheetComponent;
  let fixture: ComponentFixture<ViewTimesheetComponent>;
  let mockTimesheetService: jasmine.SpyObj<TimesheetService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockTimesheetTemplateService: jasmine.SpyObj<TimesheetTemplateService>;
  let mockPoService: jasmine.SpyObj<PoService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockConsultantService: jasmine.SpyObj<ConsultantService>;

  const mockGeneratedTimesheet: GeneratedTimesheet = {
    id: 'ts-123',
    consultantId: 'consultant-1',
    month: 1,
    year: 2024,
    pgContractType: '',
    pgContractId: '',
    pgConsultantId: '',
    clientShortName: '',
    clientId: '',
    projectName: '',
    projectId: '',
    poId: '',
    poNo: '',
    abrufName: '',
    abrufId: '',
    statuses: {
      id: 'status-1',
      statusKey: TimesheetStatus.importedTimesheetMatched,
      statusGoodName: 'TS Imported',
      datetime: new Date().toISOString(),
      statusHistory: []
    },
    // Add other required properties of GeneratedTimesheet
  };

  const allStatusTemplates = [
    { statusKey: 'TS_APR_1', statusGoodName: '1st lvl Approved' },
    { statusKey: 'TS_APR_2', statusGoodName: '2nd lvl Approved' },
    { statusKey: 'TS_COR', statusGoodName: 'Correction Required' },
    { statusKey: 'TS_OTHER', statusGoodName: 'Other Status' },
  ];

  beforeEach(async () => {
    mockTimesheetService = jasmine.createSpyObj('TimesheetService', [
      'getAllTimesheetStatusTemplates',
      'updateGeneratedTimesheetStatus',
      'getImportTimesheetData',
      'downloadGeneratedTimesheet',
      'deleteOfGeneratedTimesheet',
      'getCommentByTimesheetId',
      'deleteCommentByCommentId',
      'addComment',
      'editCommentByStatus',
      'downloadImportedTimesheet',
      'updateImportedTimesheetStatus'
    ]);
    mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);
    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getAllProfilePicture'], { profilePicUrl$: of('mock-url'), userName$: of({name: 'Test User', email: 'test@user.com'}) });
    mockTimesheetTemplateService = jasmine.createSpyObj('TimesheetTemplateService', ['getTemplateById']);
    mockPoService = jasmine.createSpyObj('PoService', ['getPoDetailsById']);
    mockProjectService = jasmine.createSpyObj('ProjectService', ['getProjectById']);
    mockConsultantService = jasmine.createSpyObj('ConsultantService', ['getConsultantById']);

    await TestBed.configureTestingModule({
      declarations: [ViewTimesheetComponent],
      imports: [
        NoopAnimationsModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatIconModule,
        MatTooltipModule,
        FormsModule,
        MatSelectModule,
        MatFormFieldModule,
      ],
      providers: [
        { provide: TimesheetService, useValue: mockTimesheetService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: AuthService, useValue: mockAuthService },
        { provide: TimesheetTemplateService, useValue: mockTimesheetTemplateService },
        { provide: PoService, useValue: mockPoService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: ConsultantService, useValue: mockConsultantService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTimesheetComponent);
    component = fixture.componentInstance;
    component.timesheetData = JSON.parse(JSON.stringify(mockGeneratedTimesheet)); // Deep copy
    mockTimesheetService.getAllTimesheetStatusTemplates.and.returnValue(of({ status: 200, body: allStatusTemplates }));
    mockTimesheetService.getCommentByTimesheetId.and.returnValue(of({status: 200, body: []}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
