import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateClientsComponent } from './create-clients.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Client } from '../../../../models/client';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ClientsService } from '../../services/client/clients.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('CreateClientsComponent', () => {
  let component: CreateClientsComponent;
  let fixture: ComponentFixture<CreateClientsComponent>;
  let toastr: ToastrService;
  let dialogRef: MatDialogRef<CreateClientsComponent>;
  let clientService: ClientsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateClientsComponent],
      imports: [HttpClientTestingModule, ToastrModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        ClientsService,
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateClientsComponent);
    component = fixture.componentInstance;
    toastr = TestBed.inject(ToastrService);
    clientService = TestBed.inject(ClientsService);
    dialogRef = TestBed.inject(MatDialogRef);

    spyOn(toastr, 'success');
    spyOn(toastr, 'warning');
    spyOn(toastr, 'error');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle validation errors when the form is not valid while creating', () => {
    component.clientForm.setErrors({ invalid: true });
    spyOn(component, 'showToasterWarning');
    spyOn(clientService, 'createClient');

    component.createClient(component.clientForm.value as Client);

    expect(component.showToasterWarning).toHaveBeenCalledWith('Form has validation errors.');
    expect(clientService.createClient).not.toHaveBeenCalled();
  });

  it('should handle validation errors when the form is not valid while editing', () => {
    component.clientForm.setErrors({ invalid: true });
    spyOn(component, 'showToasterWarning');
    spyOn(clientService, 'updateClient');

    component.editClient('', component.clientForm.value as Client);

    expect(component.showToasterWarning).toHaveBeenCalledWith('Form has validation errors.');
    expect(clientService.updateClient).not.toHaveBeenCalled();
  });

  it('should enforce maximum length for shortName and legalName', () => {
    const clientShortNameControl = component.clientForm.get('shortName');
    const clientLegalNameControl = component.clientForm.get('legalName');

    clientShortNameControl?.setValue('a'.repeat(51));
    clientLegalNameControl?.setValue('b'.repeat(101));

    expect(clientShortNameControl?.invalid).toBeTruthy();
    expect(clientLegalNameControl?.invalid).toBeTruthy();
  });

  it('should call toastr.success with correct parameters', () => {
    const message = 'Test message success';
    component.showToasterSuccess(message);
    expect(toastr.success).toHaveBeenCalledWith(message, '', { timeOut: 10000 });
  });

  it('should call toastr.warning with correct parameters', () => {
    const message = 'Test message warning';
    component.showToasterWarning(message);
    expect(toastr.warning).toHaveBeenCalledWith(message, '', { timeOut: 10000 });
  });

  it('should close the dialog', () => {
    component.closeDialog(true);
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should handle client creation successfully', () => {
    const clientData: Client = { id: '', shortName: 'Test Client', legalName: 'Test Legal', status: 'ACTIVE' };
    component.clientForm.setValue(clientData);

    spyOn(clientService, 'createClient').and.returnValue(of({ status: 201, headers: { get: () => 'some/location' } }) as any);

    component.createClient(clientData);

    expect(component.dialogRef.close).toHaveBeenCalledWith(true);
    expect(toastr.success).toHaveBeenCalledWith('Client created successfully', '', { timeOut: 10000 });
  });

  it('should handle client creation failure with duplicate client error', () => {
    const clientData: Client = { id: '', shortName: 'Test Client', legalName: 'Test Legal', status: 'ACTIVE' };
    component.clientForm.setValue(clientData);

    spyOn(clientService, 'createClient').and.returnValue(throwError(new HttpErrorResponse({ status: 409 })));

    component.createClient(clientData);

    expect(toastr.error).toHaveBeenCalledWith('Client already exists');
    expect(component.clientForm.get('shortName')?.hasError('duplicateClient')).toBeTrue();
  });

  it('should handle client edit successfully', () => {
    const clientData: Client = { id: '123', shortName: 'Test Client', legalName: 'Test Legal', status: 'ACTIVE' };
    component.clientForm.setValue(clientData);

    spyOn(clientService, 'updateClient').and.returnValue(of({ status: 200 }) as any);

    component.editClient(clientData.id, clientData);

    expect(component.dialogRef.close).toHaveBeenCalledWith(true);
    expect(toastr.success).toHaveBeenCalledWith('Client updated successfully', '', { timeOut: 10000 });
  });

  it('should handle client edit failure with duplicate client error', () => {
    const clientData: Client = { id: '123', shortName: 'Test Client', legalName: 'Test Legal', status: 'ACTIVE' };
    component.clientForm.setValue(clientData);

    spyOn(clientService, 'updateClient').and.returnValue(throwError(new HttpErrorResponse({ status: 409 })));

    component.editClient(clientData.id, clientData);

    expect(toastr.error).toHaveBeenCalledWith('Client already exists');
    expect(component.clientForm.get('shortName')?.hasError('duplicateClient')).toBeTrue();
  });

  it('should patch form values when data is passed in', () => {
    const clientData: Client = { id: '123', shortName: 'Test Client', legalName: 'Test Legal', status: 'ACTIVE' };
    component.data = clientData;

    component.ngOnInit();

    expect(component.clientForm.value).toEqual(clientData);
  });

  it('should not patch form values when no data is passed in', () => {
    component.data = null;

    component.ngOnInit();

    expect(component.clientForm.value).toEqual({
      id: '',
      shortName: '',
      legalName: '',
      status: 'ACTIVE',
    });
  });

  it('should open confirmation modal when form is dirty and attempting to close', () => {
    component.clientForm.markAsDirty();
    const dialog = TestBed.inject(MatDialog);
    const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefMock.afterClosed.and.returnValue(of(true));
    (dialog.open as jasmine.Spy).and.returnValue(dialogRefMock);

    component.closeDialog(false);

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should close the dialog without confirmation modal when form is not dirty', () => {
    component.clientForm.markAsPristine();

    component.closeDialog(false);

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should call createClient when data is null', () => {
    spyOn(component, 'createClient');
    component.data = null;
    component.saveClientProfile();
    expect(component.createClient).toHaveBeenCalledWith(component.clientForm.value as Client);
  });

  it('should call editClient when data is not null', () => {
    spyOn(component, 'editClient');
    const mockData = { id: '123' }; // assuming your data object has an id field
    component.data = mockData;
    component.saveClientProfile();
    expect(component.editClient).toHaveBeenCalledWith(mockData.id, component.clientForm.value as Client);
  });

});
