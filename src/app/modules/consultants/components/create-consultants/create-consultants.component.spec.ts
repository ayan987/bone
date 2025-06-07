import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateConsultantsComponent } from './create-consultants.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ConsultantService } from '../../../shared/services/consultant/consultant.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ConsultantStatus } from '../../../../models/consultants-status-enum';
import { HttpErrorResponse } from '@angular/common/http';

describe('CreateConsultantsComponent', () => {
  let component: CreateConsultantsComponent;
  let fixture: ComponentFixture<CreateConsultantsComponent>;
  let consultantService: jasmine.SpyObj<ConsultantService>;
  let toastrService: jasmine.SpyObj<ToastrService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<CreateConsultantsComponent>>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let fb: FormBuilder;

  beforeEach(async () => {
    const consultantServiceSpy = jasmine.createSpyObj('ConsultantService', ['createConsultant', 'editConsultant']);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [CreateConsultantsComponent],
      imports: [HttpClientTestingModule, ToastrModule.forRoot(), ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConsultantService, useValue: consultantServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateConsultantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    consultantService = TestBed.inject(ConsultantService) as jasmine.SpyObj<ConsultantService>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<CreateConsultantsComponent>>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    fb = TestBed.inject(FormBuilder);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a new consultant when data is null and form is valid', () => {
    const consultantData: any = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: ConsultantStatus.Active,
    };

    component.createConsultantForm.setValue(consultantData);
    component.data = null;

    consultantService.createConsultant.and.returnValue(of({ status: 201 }) as any);

    component.saveConsultant();

    expect(consultantService.createConsultant).toHaveBeenCalledWith(consultantData);
    expect(dialogRef.close).toHaveBeenCalledWith(true);
    expect(toastrService.success).toHaveBeenCalledWith('Consultant created successfully');
  });

  it('should edit an existing consultant when data is not null and form is valid', () => {
    const consultantId = '123';
    const consultantData: any = {
      id: consultantId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: ConsultantStatus.Active,
    };

    component.createConsultantForm.setValue(consultantData);
    component.data = { id: consultantId };

    consultantService.editConsultant.and.returnValue(of({ status: 200 }) as any);

    component.saveConsultant();

    expect(consultantService.editConsultant).toHaveBeenCalledWith(consultantId, consultantData);
    expect(dialogRef.close).toHaveBeenCalledWith(true);
    expect(toastrService.success).toHaveBeenCalledWith('Consultant updated successfully');
  });

  it('should handle HTTP error when creating a consultant', () => {
    const consultantData: any = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: ConsultantStatus.Active,
    };

    component.createConsultantForm.setValue(consultantData);
    component.data = null;

    const errorResponse = new HttpErrorResponse({
      status: 409,
      error: 'Conflict',
    });

    consultantService.createConsultant.and.returnValue(throwError(errorResponse));

    component.saveConsultant();

    expect(consultantService.createConsultant).toHaveBeenCalledWith(consultantData);
    expect(component.isCreatingConsultant).toBeFalse();
    expect(toastrService.error).toHaveBeenCalledWith('Consultant already exists');
    expect(component.createConsultantForm.get('email')?.hasError('duplicateEmail')).toBeTrue();
  });

  it('should open confirm modal and close dialog when closing with dirty form', () => {
    component.createConsultantForm.markAsDirty();

    const confirmDialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
    dialog.open.and.returnValue(confirmDialogRefSpy);

    component.closeDialog(true);

    expect(dialog.open).toHaveBeenCalled();
    expect(confirmDialogRefSpy.afterClosed).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog directly if form is not dirty', () => {
    component.createConsultantForm.markAsPristine();

    component.closeDialog(true);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should patch consultant values on init', () => {
    const consultantData = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: ConsultantStatus.Active,
    };

    component.patchConsultantValues(consultantData);

    expect(component.createConsultantForm.value).toEqual(consultantData);
  });
});
