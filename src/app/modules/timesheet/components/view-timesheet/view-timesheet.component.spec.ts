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
import { HttpResponse } from '@angular/common/http';
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
    pgConsultantId: 'consultant-1',
    month: 1,
    year: 2024,
    labels: { labels: [] },
    endDateMonthYear: 'Jan 2024',
    clientShortName: '',
    projectName: '',
    poNo: '',
    abrufName: '',
    abrufId: '',
    statuses: {
      id: 'status-1',
      statusKey: TimesheetStatus.importedTimesheetMatched,
      statusGoodName: 'TS Imported',
      datetime: new Date().toISOString(),
      statusHistory: [],
      reason: null
    },
  };

  const allStatusTemplates = [
    { statusKey: TimesheetStatus.importedTimesheetMatched, statusGoodName: 'TS Imported' },
    { statusKey: 'TS_APV_L1', statusGoodName: '1st lvl Approved' },
    { statusKey: 'TS_APV_L2', statusGoodName: '2nd lvl Approved' },
    { statusKey: TimesheetStatus.correctionNeeded, statusGoodName: 'Correction Required' },
    { statusKey: 'TS_OTHER', statusGoodName: 'Other Status' },
  ];

  const mockImportTimesheetData = {
    id: 'import-456',
    currentStatus: 'IMPORTED',
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
    component.timesheetData = JSON.parse(JSON.stringify(mockGeneratedTimesheet));
    component.importTimesheetData = JSON.parse(JSON.stringify(mockImportTimesheetData));
    if (component.timesheetData && component.timesheetData.statuses) {
        component.importTimesheetData.currentStatus = component.timesheetData.statuses.statusGoodName;
    }

    mockTimesheetService.getAllTimesheetStatusTemplates.and.returnValue(of(new HttpResponse({ status: 200, body: [...allStatusTemplates] })));
    mockTimesheetService.getCommentByTimesheetId.and.returnValue(of(new HttpResponse({status: 200, body: []})));
    mockTimesheetService.getImportTimesheetData.and.returnValue(of(new HttpResponse({ status: 200, body: { importHistory: [], statusHistory: [] } })));
    mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));


    fixture.detectChanges(); // This calls ngOnInit initially
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should assign approvedLvl1Key and approvedLvl2Key from fetched statuses', fakeAsync(() => {
      // ngOnInit is called in the main beforeEach -> fixture.detectChanges()
      tick(); // Ensure async operations from ngOnInit complete
      expect(component.approvedLvl1Key).toBe('TS_APV_L1');
      expect(component.approvedLvl2Key).toBe('TS_APV_L2');
    }));

    it('should warn if approved level statuses are not found', fakeAsync(() => {
      const incompleteStatuses = [
        { statusKey: TimesheetStatus.importedTimesheetMatched, statusGoodName: 'TS Imported' },
        { statusKey: TimesheetStatus.correctionNeeded, statusGoodName: 'Correction Required' },
      ];
      // Override the default mock for this specific test
      mockTimesheetService.getAllTimesheetStatusTemplates.and.returnValue(of(new HttpResponse({ status: 200, body: incompleteStatuses })));
      spyOn(console, 'warn');

      component.ngOnInit(); // Re-trigger ngOnInit with the new mock setup for this test
      tick();

      expect(component.approvedLvl1Key).toBeUndefined();
      expect(component.approvedLvl2Key).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith('Status key for "1st lvl Approved" not found.');
      expect(console.warn).toHaveBeenCalledWith('Status key for "2nd lvl Approved" not found.');
    }));
  });

  describe('Inline Status Editing UI', () => { // This block name might need update if UI is no longer "inline"
    const getEditIcon = () => fixture.debugElement.query(By.css('mat-icon[mattooltip="Edit status"]'));
    // const getStatusTextSpan = () => fixture.debugElement.query(By.css('ng-container[ngif="!editingStatus"] > span')); // Old
    // const getDropdown = () => fixture.debugElement.query(By.css('mat-select')); // Old inline dropdown
    // const getCheckIcon = () => fixture.debugElement.query(By.css('mat-icon.text-green-500')); // Old inline
    // const getCancelIcon = () => fixture.debugElement.query(By.css('mat-icon.text-red-500')); // Old inline
    // const getCommentTextarea = () => fixture.debugElement.query(By.css('textarea[matInput]')); // Old inline comment

    // Helpers for new UI section
    const getEditingSectionDiv = () => fixture.debugElement.query(By.css('div.border.border-gray-300'));
    const getNewDropdown = () => getEditingSectionDiv()?.query(By.css('mat-select'));
    const getNewSaveButton = () => getEditingSectionDiv()?.query(By.css('button[mattooltip="Save"]'));
    const getNewCancelButton = () => getEditingSectionDiv()?.query(By.css('button[mattooltip="Cancel"]'));
    const getNewReasonInput = () => getEditingSectionDiv()?.query(By.css('input[matInput][placeholder="Enter reason"]'));


    beforeEach(fakeAsync(() => {
        component.timesheetData = JSON.parse(JSON.stringify(mockGeneratedTimesheet));
        component.timesheetData!.statuses!.statusKey = TimesheetStatus.importedTimesheetMatched;
        component.isEditingStatusSectionOpen = false; // Ensure this is reset
        component.ngOnInit(); // Re-run to ensure keys are set based on `allStatusTemplates`
        tick();
        fixture.detectChanges();
    }));

    it('should initialize isEditingStatusSectionOpen to false', () => {
        expect(component.isEditingStatusSectionOpen).toBeFalse();
    });

    describe('openStatusEditSection()', () => {
      it('should set isEditingStatusSectionOpen to true and initialize editing fields if editable', () => {
        spyOnProperty(component, 'isCurrentStatusEditable', 'get').and.returnValue(true);
        component.openStatusEditSection();
        expect(component.isEditingStatusSectionOpen).toBeTrue();
        expect(component.originalStatus).toEqual(component.timesheetData!.statuses);
        expect(component.selectedStatusInEdit).toEqual(component.editableStatuses.find(s => s.statusKey === component.timesheetData!.statuses!.statusKey));
        expect(component.commentInEdit).toBe(component.timesheetData!.statuses!.reason || '');
      });

      it('should not open edit section if current status is not editable', () => {
        spyOnProperty(component, 'isCurrentStatusEditable', 'get').and.returnValue(false);
        component.openStatusEditSection();
        expect(component.isEditingStatusSectionOpen).toBeFalse();
      });
    });

    describe('closeStatusEditSection()', () => {
      it('should set isEditingStatusSectionOpen to false and clear fields', () => {
        component.isEditingStatusSectionOpen = true;
        component.selectedStatusInEdit = {};
        component.commentInEdit = 'test';

        component.closeStatusEditSection();

        expect(component.isEditingStatusSectionOpen).toBeFalse();
        expect(component.selectedStatusInEdit).toBeNull();
        expect(component.commentInEdit).toBe('');
      });
    });

    describe('Edit Icon Interaction (New UI)', () => {
      it('should call openStatusEditSection() when main edit icon is clicked and section is not open and status is editable', fakeAsync(() => {
        spyOn(component, 'openStatusEditSection');
        spyOnProperty(component, 'isCurrentStatusEditable', 'get').and.returnValue(true);
        component.isEditingStatusSectionOpen = false;
        fixture.detectChanges();

        const editIcon = getEditIcon();
        expect(editIcon).toBeTruthy("Edit icon should be visible");
        editIcon.nativeElement.click();
        tick();

        expect(component.openStatusEditSection).toHaveBeenCalled();
      }));

      it('main edit icon should be hidden if section is open', () => {
        spyOnProperty(component, 'isCurrentStatusEditable', 'get').and.returnValue(true);
        component.isEditingStatusSectionOpen = true;
        fixture.detectChanges();
        expect(getEditIcon()).toBeNull(); // Because of *ngIf="!isEditingStatusSectionOpen && ..."
      });

      it('main edit icon should be hidden if status is not editable', () => {
        spyOnProperty(component, 'isCurrentStatusEditable', 'get').and.returnValue(false);
        component.isEditingStatusSectionOpen = false;
        fixture.detectChanges();
        expect(getEditIcon()).toBeNull();  // Because of *ngIf="... && isCurrentStatusEditable"
      });
    });

    describe('New Editing Section Visibility and Content', () => {
      it('should show the new editing section when isEditingStatusSectionOpen is true', fakeAsync(() => {
        component.isEditingStatusSectionOpen = true;
        fixture.detectChanges();
        tick();
        expect(getEditingSectionDiv()).toBeTruthy();
        expect(getNewDropdown()).toBeTruthy();
        expect(getNewSaveButton()).toBeTruthy();
        expect(getNewCancelButton()).toBeTruthy();
      }));

      it('should hide the new editing section when isEditingStatusSectionOpen is false', fakeAsync(() => {
        component.isEditingStatusSectionOpen = false;
        fixture.detectChanges();
        tick();
        expect(getEditingSectionDiv()).toBeNull();
      }));

      it('Reason input field should be visible in new section if status is Correction Required and section is open', fakeAsync(() => {
        component.isEditingStatusSectionOpen = true;
        component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === TimesheetStatus.correctionNeeded);
        fixture.detectChanges();
        tick();
        expect(getNewReasonInput()).toBeTruthy();
      }));

      it('Reason input field should be hidden in new section if status is not Correction Required and section is open', fakeAsync(() => {
        component.isEditingStatusSectionOpen = true;
        component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
        fixture.detectChanges();
        tick();
        expect(getNewReasonInput()).toBeNull();
      }));
    });

    describe('Save/Cancel Buttons in New Section', () => {
      beforeEach(fakeAsync(() => {
        component.isEditingStatusSectionOpen = true; // Open the section
        // Ensure originalStatus is set, as if openStatusEditSection was called
        component.originalStatus = JSON.parse(JSON.stringify(component.timesheetData!.statuses));
        component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === component.timesheetData!.statuses!.statusKey);
        component.commentInEdit = component.timesheetData!.statuses!.reason || '';
        fixture.detectChanges();
        tick();
      }));

      it('Save button should call saveStatusAndStopEditing()', () => {
        spyOn(component, 'saveStatusAndStopEditing');
        const saveButton = getNewSaveButton();
        expect(saveButton).toBeTruthy();
        saveButton.nativeElement.click();
        expect(component.saveStatusAndStopEditing).toHaveBeenCalled();
      });

      it('Cancel button should call closeStatusEditSection()', () => {
        spyOn(component, 'closeStatusEditSection');
        const cancelButton = getNewCancelButton();
        expect(cancelButton).toBeTruthy();
        cancelButton.nativeElement.click();
        expect(component.closeStatusEditSection).toHaveBeenCalled();
      });
    });

    describe('Dropdown Population and Interaction (within new section)', () => {
        it('editableStatuses should be populated correctly including "TS Imported" and "Correction Required" by key', () => {
            const expectedStatusKeysOrGoodNames = [
                TimesheetStatus.importedTimesheetMatched,
                '1st lvl Approved',
                '2nd lvl Approved',
                TimesheetStatus.correctionNeeded
            ];
            const actualPresent = component.editableStatuses.map(s => s.statusKey === TimesheetStatus.importedTimesheetMatched || s.statusKey === TimesheetStatus.correctionNeeded ? s.statusKey : s.statusGoodName);
            expectedStatusKeysOrGoodNames.forEach(val => {
                expect(actualPresent).toContain(val);
            });
            expect(component.editableStatuses.length).toBe(4);
        });

        it('onStatusSelectionChange should update selectedStatusInEdit and clear comment if not Correction Required', () => {
            component.openStatusEditSection();
            component.commentInEdit = 'A comment';
            fixture.detectChanges();

            const apr1Status = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
            expect(apr1Status).toBeDefined("'TS_APV_L1' status should exist in editableStatuses");

            component.onStatusSelectionChange({ value: apr1Status } as any);
            fixture.detectChanges();

            expect(component.selectedStatusInEdit.statusKey).toBe('TS_APV_L1');
            expect(component.commentInEdit).toBe('');
        });

         it('onStatusSelectionChange should NOT clear comment if Correction Required is selected', () => {
            component.openStatusEditSection();
            fixture.detectChanges();

            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
            component.commentInEdit = "Initial Comment";
            fixture.detectChanges();

            const corStatus = component.editableStatuses.find(s => s.statusKey === TimesheetStatus.correctionNeeded);
            expect(corStatus).toBeDefined("Correction Required status should exist in editableStatuses");

            component.onStatusSelectionChange({ value: corStatus } as any);
            fixture.detectChanges();

            expect(component.selectedStatusInEdit.statusKey).toBe(TimesheetStatus.correctionNeeded);
            expect(component.commentInEdit).toBe("Initial Comment");
        });
    });

    describe('saveStatusAndStopEditing()', () => {
        beforeEach(fakeAsync(() => {
            component.openStatusEditSection();
            fixture.detectChanges();
            tick();
        }));

        it('should show error if no status selected', () => {
            component.selectedStatusInEdit = null;
            component.saveStatusAndStopEditing();
            expect(mockToastrService.error).toHaveBeenCalledWith('Please select a status.');
        });

        it('should call closeStatusEditSection if current status is re-selected without changes', () => {
            spyOn(component, 'closeStatusEditSection').and.callThrough();
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === component.originalStatus.statusKey);
            component.commentInEdit = component.originalStatus.reason || '';
            component.saveStatusAndStopEditing();
            expect(component.closeStatusEditSection).toHaveBeenCalled();
            expect(mockTimesheetService.updateGeneratedTimesheetStatus).not.toHaveBeenCalled();
        });

        it('should save if original status was Correction Required and is re-selected but comment has changed', () => {
            component.originalStatus = { ...component.originalStatus, statusKey: TimesheetStatus.correctionNeeded, reason: 'Old comment' };
            // Need to re-initialize selectedStatusInEdit and commentInEdit for this specific test case based on changed originalStatus
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === TimesheetStatus.correctionNeeded);
            component.commentInEdit = 'New comment';

            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            expect(mockTimesheetService.updateGeneratedTimesheetStatus).toHaveBeenCalled();
            expect(mockTimesheetService.updateImportedTimesheetStatus).toHaveBeenCalled();
            expect(mockToastrService.success).toHaveBeenCalledWith('Timesheet and import status updated successfully.');
            expect(component.isEditingStatusSectionOpen).toBeFalse();
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });


        it('should show error if Correction Required selected without comment', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === TimesheetStatus.correctionNeeded);
            component.commentInEdit = '';
            component.saveStatusAndStopEditing();
            expect(mockToastrService.error).toHaveBeenCalledWith('Please enter a comment for correction.');
            expect(mockTimesheetService.updateGeneratedTimesheetStatus).not.toHaveBeenCalled();
        });

        it('should call both services for new status (e.g., 1st lvl Approved with TS_APV_L1 key) and show combined success', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            const expectedGeneratedPayload = {
                id: component.originalStatus.id,
                statusKey: 'TS_APV_L1',
                statusGoodName: '1st lvl Approved',
                datetime: jasmine.any(String),
                reason: null,
                statusHistory: jasmine.arrayContaining([jasmine.objectContaining({statusKey: 'TS_APV_L1'})])
            };
            expect(mockTimesheetService.updateGeneratedTimesheetStatus).toHaveBeenCalledWith(component.timesheetData!.id, jasmine.objectContaining(expectedGeneratedPayload));
            expect(mockTimesheetService.updateImportedTimesheetStatus).toHaveBeenCalledWith(component.importTimesheetData.id, 'TS_APV_L1');
            expect(mockToastrService.success).toHaveBeenCalledWith('Timesheet and import status updated successfully.');
            expect(component.isEditingStatusSectionOpen).toBeFalse();
            expect(component.timesheetData?.statuses?.statusKey).toBe('TS_APV_L1');
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });

        it('should call updateImportedTimesheetStatus with "IMPORTED" when selected status is importedTimesheetMatched', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === TimesheetStatus.importedTimesheetMatched);
            component.originalStatus.statusKey = 'SOME_OTHER_KEY_TO_FORCE_SAVE';

            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            expect(mockTimesheetService.updateImportedTimesheetStatus).toHaveBeenCalledWith(component.importTimesheetData.id, 'IMPORTED');
        });


        it('should call both services for Correction Required with comment and show combined success', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === TimesheetStatus.correctionNeeded);
            component.commentInEdit = 'Detailed correction info';
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            const expectedGeneratedPayload = {
                id: component.originalStatus.id,
                statusKey: TimesheetStatus.correctionNeeded,
                statusGoodName: 'Correction Required',
                datetime: jasmine.any(String),
                reason: 'Detailed correction info',
                statusHistory: jasmine.arrayContaining([jasmine.objectContaining({statusKey: TimesheetStatus.correctionNeeded, reason: 'Detailed correction info'})])
            };
            expect(mockTimesheetService.updateGeneratedTimesheetStatus).toHaveBeenCalledWith(component.timesheetData!.id, jasmine.objectContaining(expectedGeneratedPayload));
            expect(mockTimesheetService.updateImportedTimesheetStatus).toHaveBeenCalledWith(component.importTimesheetData.id, TimesheetStatus.correctionNeeded);
            expect(mockToastrService.success).toHaveBeenCalledWith('Timesheet and import status updated successfully.');
            expect(component.isEditingStatusSectionOpen).toBeFalse();
            expect(component.timesheetData?.statuses?.statusKey).toBe(TimesheetStatus.correctionNeeded);
            expect(component.timesheetData?.statuses?.reason).toBe('Detailed correction info');
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });

        it('should handle error from first API call (updateGeneratedTimesheetStatus) and remain in edit mode', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(throwError(() => new Error('API Down')));
            spyOn(component, 'closeStatusEditSection');

            component.saveStatusAndStopEditing();

            expect(mockToastrService.error).toHaveBeenCalledWith('An error occurred while updating status.');
            expect(component.isEditingStatusSectionOpen).toBeTrue();
            expect(component.closeStatusEditSection).not.toHaveBeenCalled();
        });

        it('should handle error from second API call (updateImportedTimesheetStatus) and show specific error', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(throwError(() => new Error('Import Update Failed')));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            expect(mockToastrService.error).toHaveBeenCalledWith('Timesheet status updated, but failed to update import status.');
            expect(component.isEditingStatusSectionOpen).toBeFalse();
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });

        it('should handle unexpected response from second API call (updateImportedTimesheetStatus)', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 201 })));
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            expect(mockToastrService.warning).toHaveBeenCalledWith('Timesheet status updated, but import status update returned an unexpected response.');
            expect(component.isEditingStatusSectionOpen).toBeFalse();
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });

        it('should show warning toast if updateImportedTimesheetStatus returns a service-generated error (e.g. 500 response)', () => {
          component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
          mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
          mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 500, statusText: 'Unexpected null response from HTTP call mapping', body: null })));
          spyOn(component, 'closeSideBar');

          component.saveStatusAndStopEditing();

          expect(mockToastrService.warning).toHaveBeenCalledWith('Timesheet status updated, but import status update returned an unexpected response.');
          expect(component.isEditingStatusSectionOpen).toBeFalse();
          expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });

        it('should handle missing importTimesheetData.id for the second API call', () => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            component.importTimesheetData.id = null;
            spyOn(component, 'closeSideBar');

            component.saveStatusAndStopEditing();

            expect(mockToastrService.success).toHaveBeenCalledWith('Timesheet status updated successfully. Import status not updated (missing data).');
            expect(mockTimesheetService.updateImportedTimesheetStatus).not.toHaveBeenCalled();
            expect(component.isEditingStatusSectionOpen).toBeFalse();
            expect(component.closeSideBar).toHaveBeenCalledWith(true);
        });


        it('should update importTimesheetData.currentStatus on successful save for approved status (both calls succeed)', fakeAsync(() => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === 'TS_APV_L1');
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            component.saveStatusAndStopEditing();
            tick();
            fixture.detectChanges();
            expect(component.importTimesheetData.currentStatus).toBe('APPROVED');
        }));

        it('should update importTimesheetData.currentStatus on successful save for correction required status (both calls succeed)', fakeAsync(() => {
            component.selectedStatusInEdit = component.editableStatuses.find(s => s.statusKey === TimesheetStatus.correctionNeeded);
            component.commentInEdit = "Needs fix";
            mockTimesheetService.updateGeneratedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            mockTimesheetService.updateImportedTimesheetStatus.and.returnValue(of(new HttpResponse({ status: 204 })));
            component.saveStatusAndStopEditing();
            tick();
            fixture.detectChanges();
            expect(component.importTimesheetData.currentStatus).toBe('CORRECTION REQUIRED');
        }));

    });

    describe('getImportTimesheetData() Behavior', () => {
        it('should call closeStatusEditSection if isEditingStatusSectionOpen is true when data is successfully fetched', fakeAsync(() => {
            component.openStatusEditSection();
            fixture.detectChanges();
            tick();
            expect(component.isEditingStatusSectionOpen).toBeTrue();
            spyOn(component, 'closeStatusEditSection').and.callThrough();

            mockTimesheetService.getImportTimesheetData.and.returnValue(of(new HttpResponse({ status: 200, body: { importHistory: [], statusHistory: [], currentStatus: 'NEW_STATUS' } })));
            component.getImportTimesheetData('checksum-123');
            tick();

            expect(component.closeStatusEditSection).toHaveBeenCalled();
            expect(component.isEditingStatusSectionOpen).toBeFalse();
        }));

        it('should NOT call closeStatusEditSection if isEditingStatusSectionOpen is false when getImportTimesheetData is called', fakeAsync(() => {
            component.isEditingStatusSectionOpen = false;
            fixture.detectChanges();
            tick();
            spyOn(component, 'closeStatusEditSection').and.callThrough();

            mockTimesheetService.getImportTimesheetData.and.returnValue(of(new HttpResponse({ status: 200, body: { importHistory: [], statusHistory: [] } })));
            component.getImportTimesheetData('checksum-123');
            tick();

            expect(component.closeStatusEditSection).not.toHaveBeenCalled();
        }));
    });
  });
});
