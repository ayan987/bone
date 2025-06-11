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
    { statusKey: TimesheetStatus.importedTimesheetMatched, statusGoodName: 'TS Imported' },
    { statusKey: 'TS_APR_1', statusGoodName: '1st lvl Approved' },
    { statusKey: 'TS_APR_2', statusGoodName: '2nd lvl Approved' },
    { statusKey: 'TS_COR', statusGoodName: 'Correction Required' },
    { statusKey: 'TS_OTHER', statusGoodName: 'Other Status' },
  ];

  // Mock for importTimesheetData as it's accessed in the template
  const mockImportTimesheetData = {
    currentStatus: 'IMPORTED', // or any relevant initial status
    // ... other properties as needed by the template
  };


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
    // Initialize importTimesheetData as it's used in the template for status display
    component.importTimesheetData = JSON.parse(JSON.stringify(mockImportTimesheetData));
    component.importTimesheetData.currentStatus = component.timesheetData.statuses.statusGoodName;


    mockTimesheetService.getAllTimesheetStatusTemplates.and.returnValue(of({ status: 200, body: [...allStatusTemplates] }));
    mockTimesheetService.getCommentByTimesheetId.and.returnValue(of({status: 200, body: []}));
    mockTimesheetService.getImportTimesheetData.and.returnValue(of({ status: 200, body: { importHistory: [], statusHistory: [] } }));


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inline Status Editing UI', () => {
    const getEditIcon = () => fixture.debugElement.query(By.css('mat-icon.ml-2.cursor-pointer'));
    const getStatusTextSpan = () => fixture.debugElement.query(By.css('ng-container[ngif="!editingStatus"] > span'));
    // const getDropdown = () => fixture.debugElement.query(By.css('mat-select[formcontrolname="statusInEdit"]')); // formcontrolname might not be there
    const getDropdown = () => fixture.debugElement.query(By.css('mat-select'));
    const getCheckIcon = () => fixture.debugElement.query(By.css('mat-icon.text-green-500'));
    const getCancelIcon = () => fixture.debugElement.query(By.css('mat-icon.text-red-500'));
    const getCommentTextarea = () => fixture.debugElement.query(By.css('textarea[matInput]'));

    beforeEach(fakeAsync(() => {
        // Ensure conditions are met for edit icon to be potentially visible
        component.timesheetData!.statuses!.statusKey = TimesheetStatus.importedTimesheetMatched;
        component.timesheetData!.statuses!.statusGoodName = 'TS Imported';
        // Ensure importTimesheetData.currentStatus reflects the timesheetData's statusGoodName for consistency in the template
        if (component.importTimesheetData && component.timesheetData?.statuses?.statusGoodName) {
             component.importTimesheetData.currentStatus = component.timesheetData.statuses.statusGoodName.toUpperCase();
        }


        fixture.detectChanges();
        component.ngOnInit(); // Make sure editableStatuses are loaded
        tick(); // allow observables to complete
        fixture.detectChanges();
    }));

    describe('Edit Icon Visibility', () => {
      it('should show edit icon on hover when conditions are met', () => {
        component.isStatusHovered = true;
        fixture.detectChanges();
        expect(getEditIcon()).toBeTruthy();
      });

      it('should hide edit icon if not hovered', () => {
        component.isStatusHovered = false;
        fixture.detectChanges();
        expect(getEditIcon()).toBeNull();
      });

      it('should hide edit icon if statusKey is not TS_IMPORT_MATCHED', () => {
        component.timesheetData!.statuses!.statusKey = TimesheetStatus.generated;
        component.isStatusHovered = true;
        fixture.detectChanges();
        expect(getEditIcon()).toBeNull();
      });
    });

    describe('Edit Mode Toggling and UI State', () => {
      it('clicking edit icon should call startEditingStatus() and enter edit mode', fakeAsync(() => {
        spyOn(component, 'startEditingStatus').and.callThrough();
        component.isStatusHovered = true;
        fixture.detectChanges();

        const editIconElement = getEditIcon();
        expect(editIconElement).toBeTruthy('Edit icon should be present before click');
        editIconElement.nativeElement.click();
        tick();
        fixture.detectChanges();

        expect(component.startEditingStatus).toHaveBeenCalled();
        expect(component.editingStatus).toBeTrue();
        // Use jasmine.objectContaining for originalStatus due to potential deep copy nuances
        expect(component.originalStatus).toEqual(jasmine.objectContaining(mockGeneratedTimesheet.statuses));
        expect(component.selectedStatusInEdit.statusKey).toBe(mockGeneratedTimesheet.statuses.statusKey);
        expect(getStatusTextSpan()).toBeNull();
        expect(getDropdown()).toBeTruthy();
        expect(getCheckIcon()).toBeTruthy();
        expect(getCancelIcon()).toBeTruthy();
      }));

      it('clicking cancel icon should call cancelEditingStatus() and exit edit mode', fakeAsync(() => {
        component.startEditingStatus();
        fixture.detectChanges();
        tick();

        spyOn(component, 'cancelEditingStatus').and.callThrough();
        const cancelIconElement = getCancelIcon();
        expect(cancelIconElement).toBeTruthy('Cancel icon should be present before click');
        cancelIconElement.nativeElement.click();
        tick();
        fixture.detectChanges();

        expect(component.cancelEditingStatus).toHaveBeenCalled();
        expect(component.editingStatus).toBeFalse();
        expect(getStatusTextSpan()).toBeTruthy();
        expect(getDropdown()).toBeNull();
      }));
    });

    describe('Dropdown Population and Interaction', () => {
        it('editableStatuses should be populated correctly including "TS Imported"', () => {
            const expectedGoodNames = ['TS Imported', '1st lvl Approved', '2nd lvl Approved', 'Correction Required'];
            expect(component.editableStatuses.map(s => s.statusGoodName)).toEqual(jasmine.arrayContaining(expectedGoodNames));
        });

        it('onStatusSelectionChange should update selectedStatusInEdit and clear comment if not TS_COR', () => {
            component.startEditingStatus();
            component.commentInEdit = 'A comment';
            fixture.detectChanges();

            const apr1Status = component.editableStatuses.find(s => s.statusKey === 'TS_APR_1');
            expect(apr1Status).toBeDefined("TS_APR_1 status should exist in editableStatuses");

            component.onStatusSelectionChange({ value: apr1Status } as any);
            fixture.detectChanges();

            expect(component.selectedStatusInEdit.statusKey).toBe('TS_APR_1');
            expect(component.commentInEdit).toBe('');
        });

         it('onStatusSelectionChange should NOT clear comment if TS_COR is selected', () => {
            component.startEditingStatus();
            fixture.detectChanges();

            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APR_1'); // Start with a non-TS_COR status
            component.commentInEdit = "Initial Comment"; // Set a comment
            fixture.detectChanges();

            const corStatus = component.editableStatuses.find(s => s.statusKey === 'TS_COR');
            expect(corStatus).toBeDefined("TS_COR status should exist in editableStatuses");

            component.onStatusSelectionChange({ value: corStatus } as any); // Change to TS_COR
            fixture.detectChanges();

            expect(component.selectedStatusInEdit.statusKey).toBe('TS_COR');
            expect(component.commentInEdit).toBe("Initial Comment"); // Comment should persist when selecting TS_COR
        });
    });

    describe('Conditional Comment Field in Edit Mode', () => {
        it('should show comment field if editingStatus is true and selectedStatusInEdit is TS_COR', fakeAsync(() => {
            component.startEditingStatus();
            fixture.detectChanges();
            tick();
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_COR');
            fixture.detectChanges();
            tick();
            expect(getCommentTextarea()).toBeTruthy();
        }));

        it('should hide comment field if selectedStatusInEdit is not TS_COR', fakeAsync(() => {
            component.startEditingStatus();
            fixture.detectChanges();
            tick();
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APR_1');
            fixture.detectChanges();
            tick();
            expect(getCommentTextarea()).toBeNull();
        }));
    });

    describe('saveStatusAndStopEditing()', () => {
        beforeEach(fakeAsync(() => {
            component.startEditingStatus();
            fixture.detectChanges();
            tick();
        }));

        it('should show error if no status selected', () => {
            component.selectedStatusInEdit = null;
            component.saveStatusAndStopEditing();
            expect(mockToastrService.error).toHaveBeenCalledWith('Please select a status.');
        });

        it('should call cancelEditingStatus if current status (TS Imported) is re-selected without changes to comment if it was TS_COR', () => {
            spyOn(component, 'cancelEditingStatus').and.callThrough();
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === TimesheetStatus.importedTimesheetMatched);
            component.commentInEdit = component.originalStatus.reason || '';
            component.saveStatusAndStopEditing();
            expect(component.cancelEditingStatus).toHaveBeenCalled();
            expect(mockTimesheetService.updateGeneratedTimesheetStatus).not.toHaveBeenCalled();
        });

        it('should save if original status was TS_COR and is re-selected but comment has changed', () => {
            // Setup originalStatus to be TS_COR
            component.originalStatus = { ...component.originalStatus, statusKey: 'TS_COR', reason: 'Old comment' };
            component.selectedStatusInEdit = { ...component.editableStatuses.find(s => s.statusKey === 'TS_COR') }; // Ensure it's a TS_COR object
             // Ensure selectedStatusInEdit is properly initialized to a TS_COR status object
            const tsCorStatusObject = component.editableStatuses.find(s => s.statusKey === 'TS_COR');
            expect(tsCorStatusObject).toBeDefined("TS_COR status object must exist in editableStatuses");
            component.selectedStatusInEdit = tsCorStatusObject;
            component.commentInEdit = 'New comment'; // Comment changed

            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of({ status: 204 }));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            expect(mockTimesheetService.updateGeneratedTimesheetStatus).toHaveBeenCalled();
            expect(mockToastrService.success).toHaveBeenCalledWith('Timesheet status updated successfully.');
            expect(component.editingStatus).toBeFalse();
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });


        it('should show error if TS_COR selected without comment', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_COR');
            component.commentInEdit = '';
            component.saveStatusAndStopEditing();
            expect(mockToastrService.error).toHaveBeenCalledWith('Please enter a comment for correction.');
            expect(mockTimesheetService.updateGeneratedTimesheetStatus).not.toHaveBeenCalled();
        });

        it('should call service with correct payload for new status (e.g., 1st lvl Approved)', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APR_1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of({ status: 204 }));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            const expectedPayload = {
                id: component.originalStatus.id,
                statusKey: 'TS_APR_1',
                statusGoodName: '1st lvl Approved',
                datetime: jasmine.any(String),
                reason: null,
                statusHistory: jasmine.arrayContaining([jasmine.objectContaining({statusKey: 'TS_APR_1'})])
            };
            expect(mockTimesheetService.updateGeneratedTimesheetStatus).toHaveBeenCalledWith(component.timesheetData!.id, jasmine.objectContaining(expectedPayload));
            expect(mockToastrService.success).toHaveBeenCalledWith('Timesheet status updated successfully.');
            expect(component.editingStatus).toBeFalse();
            expect(component.timesheetData?.statuses?.statusKey).toBe('TS_APR_1');
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });

        it('should call service with correct payload for TS_COR with comment', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_COR');
            component.commentInEdit = 'Detailed correction info';
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of({ status: 204 }));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            const expectedPayload = {
                id: component.originalStatus.id,
                statusKey: 'TS_COR',
                statusGoodName: 'Correction Required',
                datetime: jasmine.any(String),
                reason: 'Detailed correction info',
                statusHistory: jasmine.arrayContaining([jasmine.objectContaining({statusKey: 'TS_COR', reason: 'Detailed correction info'})])
            };
            expect(mockTimesheetService.updateGeneratedTimesheetStatus).toHaveBeenCalledWith(component.timesheetData!.id, jasmine.objectContaining(expectedPayload));
            expect(mockToastrService.success).toHaveBeenCalledWith('Timesheet status updated successfully.');
            expect(component.editingStatus).toBeFalse();
            expect(component.timesheetData?.statuses?.statusKey).toBe('TS_COR');
            expect(component.timesheetData?.statuses?.reason).toBe('Detailed correction info');
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });

        it('should handle API error during save and remain in edit mode', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APR_1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(throwError(() => new Error('API Down')));
            spyOn(component, 'cancelEditingStatus'); // To check if it's NOT called implicitly by error handling

            component.saveStatusAndStopEditing();

            expect(mockToastrService.error).toHaveBeenCalledWith('An error occurred while updating status.');
            expect(component.editingStatus).toBeTrue();
            expect(component.cancelEditingStatus).not.toHaveBeenCalled();
        });

        it('should update importTimesheetData.currentStatus on successful save for approved status', fakeAsync(() => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APR_1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of({ status: 204 }));
            component.saveStatusAndStopEditing();
            tick();
            fixture.detectChanges();
            expect(component.importTimesheetData.currentStatus).toBe('APPROVED');
        }));

        it('should update importTimesheetData.currentStatus on successful save for correction required status', fakeAsync(() => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_COR');
            component.commentInEdit = "Needs fix";
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of({ status: 204 }));
            component.saveStatusAndStopEditing();
            tick();
            fixture.detectChanges();
            expect(component.importTimesheetData.currentStatus).toBe('CORRECTION REQUIRED');
        }));

    });

    describe('getImportTimesheetData() Behavior', () => {
        it('should call cancelEditingStatus if editingStatus is true when data is successfully fetched', fakeAsync(() => {
            component.startEditingStatus();
            fixture.detectChanges();
            tick();
            expect(component.editingStatus).toBeTrue();
            spyOn(component, 'cancelEditingStatus').and.callThrough();

            // Ensure the mock returns a successful response that would cause the `next` block to execute
            mockTimesheetService.getImportTimesheetData.and.returnValue(of({ status: 200, body: { importHistory: [], statusHistory: [], currentStatus: 'NEW_STATUS' } }));
            component.getImportTimesheetData('checksum-123');
            tick(); // allow observables to complete

            expect(component.cancelEditingStatus).toHaveBeenCalled();
            expect(component.editingStatus).toBeFalse();
        }));

        it('should NOT call cancelEditingStatus if editingStatus is false when getImportTimesheetData is called', fakeAsync(() => {
            component.editingStatus = false;
            fixture.detectChanges();
            tick();
            spyOn(component, 'cancelEditingStatus').and.callThrough();

            mockTimesheetService.getImportTimesheetData.and.returnValue(of({ status: 200, body: { importHistory: [], statusHistory: [] } }));
            component.getImportTimesheetData('checksum-123');
            tick();

            expect(component.cancelEditingStatus).not.toHaveBeenCalled();
        }));
    });

  });
});
