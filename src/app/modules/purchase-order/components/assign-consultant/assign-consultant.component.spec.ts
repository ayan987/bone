import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { AssignConsultantComponent } from './assign-consultant.component';
import { ConsultantService } from '../../../shared/services/consultant/consultant.service';
import { PoService } from '../../../shared/services/po/po.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConsultantStatus } from '../../../../models/consultants-status-enum';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { CustomDateFormatPipe } from '../../../../customDate-pipe';
import { MatInputModule } from '@angular/material/input';

class MockConsultantService {
  getAllConsultants() {
    return of({ body: [{ id: '1', status: ConsultantStatus.Active, firstName: 'John', lastName: 'Doe' }] });
  }
}

class MockPoService {
  assignConsultantToPG() {
    return of({ body: {} });
  }
}

class MockToastrService {
  success(message: string) {}
}

describe('AssignConsultantComponent', () => {
  let component: AssignConsultantComponent;
  let fixture: ComponentFixture<AssignConsultantComponent>;
  let consultantService: ConsultantService;
  let poService: PoService;
  let toastrService: ToastrService;
  let dialogRef: MatDialogRef<AssignConsultantComponent>;
  let matDialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignConsultantComponent, ConfirmModalComponent, CustomDateFormatPipe ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatSelectModule,
        MatInputModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ConsultantService, useClass: MockConsultantService },
        { provide: PoService, useClass: MockPoService },
        { provide: ToastrService, useClass: MockToastrService },
        { provide: MAT_DIALOG_DATA, useValue: [{ poStartDate: '2023-01-01', poEndDate: '2023-12-31' }] },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }) } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignConsultantComponent);
    component = fixture.componentInstance;
    consultantService = TestBed.inject(ConsultantService);
    poService = TestBed.inject(PoService);
    toastrService = TestBed.inject(ToastrService);
    dialogRef = TestBed.inject(MatDialogRef);
    matDialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should initialize consultant list on init', () => {
  //   spyOn(consultantService, 'getAllConsultants').and.callThrough();
  //   component.ngOnInit();
  //   expect(consultantService.getAllConsultants).toHaveBeenCalled();
  //   component.consultantList.subscribe((list: any) => {
  //     expect(list.length).toBe(1);
  //     expect(list[0].firstName).toBe('John');
  //   });
  // });

  // it('should validate form correctly', () => {
  //   component.assignConsultantForm.controls['consultantsArray'].setValue([{
  //     id: '1',
  //     startDate: '2023-01-01',
  //     endDate: '2023-12-31',
  //     status: 'Active'
  //   }]);
  //   // component.validateDate();
  //   expect(component.assignConsultantForm.valid).toBeTruthy();
  // });

  // it('should add a consultant', () => {
  //   component.addConsultant();
  //   expect(component.consultantsArray.length).toBe(2);
  // });

  // it('should remove a consultant', () => {
  //   component.removeConsultant(0);
  //   expect(component.consultantsArray.length).toBe(0);
  // });

  // it('should filter consultants', (done) => {
  //   component.consultantFilterCtrl.setValue('john');
  //   component.consultantList.subscribe((list: any) => {
  //     expect(list.length).toBe(1);
  //     expect(list[0].firstName).toBe('John');
  //     done();
  //   });
  // });

  // it('should assign consultants', () => {
  //   spyOn(poService, 'assignConsultantToPG').and.callThrough();
  //   component.assignConsultants();
  //   expect(poService.assignConsultantToPG).toHaveBeenCalled();
  // });

  // it('should handle errors correctly', () => {
  //   spyOn(poService, 'assignConsultantToPG').and.returnValue(throwError(new Error('error')));
  //   component.assignConsultants();
  //   expect(component.isassigningConsultant).toBeFalse();
  // });

  // it('should close dialog with confirmation when form is dirty', () => {
  //   component.assignConsultantForm.markAsDirty();
  //   component.closeDialog(false);
  //   expect(matDialog.open).toHaveBeenCalled();
  // });

  // it('should close dialog without confirmation when form is not dirty', () => {
  //   component.closeDialog(true);
  //   expect(dialogRef.close).toHaveBeenCalledWith(true);
  // });

  // it('should compare consultants', () => {
  //   expect(component.compareConsultants({ id: 1 }, { id: 1 })).toBeTrue();
  //   expect(component.compareConsultants({ id: 1 }, { id: 2 })).toBeFalse();
  // });

  // it('should handle API response correctly', () => {
  //   const response = {
  //     sameTimePeriod: [{ id: '1' }],
  //     reassigningConsultant: [{ id: '2' }]
  //   };
  //   component.handleApiResponse(response);
  //   const consultantGroup = component.consultantsArray.controls.find(
  //     (group: any) => group.get('id').value.id === '1'
  //   );
  //   expect(consultantGroup?.get('id')?.errors).toEqual({ sameTimePeriod: true });
  // });

  // it('should remove consultants not present in response', () => {
  //   const response = {
  //     sameTimePeriod: [{ id: '1' }],
  //     reassigningConsultant: [{ id: '2' }]
  //   };
  //   component.consultantsArray.setValue([
  //     { id: { id: '1' }, startDate: '2023-01-01', endDate: '2023-12-31', status: 'Active' },
  //     { id: { id: '3' }, startDate: '2023-01-01', endDate: '2023-12-31', status: 'Active' }
  //   ]);
  //   component.handleApiResponse(response);
  //   expect(component.consultantsArray.length).toBe(1);
  // });
});
