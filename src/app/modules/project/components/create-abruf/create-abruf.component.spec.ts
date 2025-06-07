import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateAbrufComponent } from './create-abruf.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { AbrufService } from '../../../shared/services/abruf/abruf.service';
import { ClientProjectService } from '../../../shared/services/client-project/client-project.service';
import { HttpResponse } from '@angular/common/http';

describe('CreateAbrufComponent', () => {
  let component: CreateAbrufComponent;
  let fixture: ComponentFixture<CreateAbrufComponent>;
  let dialogRef: MatDialogRef<CreateAbrufComponent>;
  let abrufService: AbrufService;
  let toastr: ToastrService;
  let clientProjectService: ClientProjectService;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
    open: jasmine.createSpy('open')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAbrufComponent],
      providers: [
        FormBuilder,
        AbrufService,
        ClientProjectService,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { } }
      ],
      imports: [MatDialogModule, HttpClientTestingModule, ToastrModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAbrufComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef);
    abrufService = TestBed.inject(AbrufService);
    toastr = TestBed.inject(ToastrService);
    clientProjectService = TestBed.inject(ClientProjectService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with project client data if provided', () => {
    component.projectClientData = {
      abrufId: '123',
      project: { id: 'projectId' },
      client: { id: 'clientId' },
      status: 'ACTIVE',
      abrufName: 'Abruf Name',
      abrufNo: 'Abruf-001',
      startDate: '2024-08-01',
      endDate: '2024-08-17',
    };

    component.ngOnInit();
    component.patchDataForEdit();

    expect(component.createAbrufForm.get('projectId')?.value).toBe('projectId');
    expect(component.createAbrufForm.get('clientId')?.value).toBe('clientId');
    expect(component.createAbrufForm.get('status')?.value).toBe('ACTIVE');
    expect(component.abrufs.at(0).get('abrufName')?.value).toBe('Abruf Name');
  });

  it('should handle errors during createAbruf', () => {
    spyOn(abrufService, 'createAbruf').and.returnValue(throwError({ status: 409 }));
    spyOn(toastr, 'error').and.callThrough();

    component.createAbruf();

    expect(abrufService.createAbruf).toHaveBeenCalled();
    expect(component.isCreatingAbruf).toBeFalse();
    expect(toastr.error).toHaveBeenCalledWith('Abruf No. already exists in the Project-Client Association!');
    // expect(component.createAbrufForm.get('abrufNo')?.hasError('duplicateAbrufNo')).toBeTrue();
  });

  it('should handle errors during updateAbruf', () => {
    spyOn(abrufService, 'updateAbruf').and.returnValue(throwError({ status: 409 }));
    spyOn(toastr, 'error').and.callThrough();

    component.projectClientData = { abrufId: '123' };
    component.updateAbruf();

    expect(abrufService.updateAbruf).toHaveBeenCalled();
    expect(component.isCreatingAbruf).toBeFalse();
    expect(toastr.error).toHaveBeenCalledWith('Abruf No. already exists in the Project-Client Association!');
    // expect(component.createAbrufForm.get('abrufNo')?.hasError('duplicateAbrufNo')).toBeTrue();
  });

  it('should open confirmation dialog when closeDialog is invoked and form is dirty', () => {
    component.createAbrufForm.markAsDirty();
    const dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open').and.callThrough();

    component.closeDialog(false);

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should close the dialog without confirmation when form is not dirty', () => {
    component.createAbrufForm.markAsPristine();
    component.closeDialog(false);

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should validate dates correctly', () => {
    spyOn(component.createAbrufForm, 'updateValueAndValidity').and.callThrough();
    component.validateDate();
    expect(component.createAbrufForm.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should filter client projects correctly', () => {
    // Mock the projectClientAssign property
    Object.defineProperty(component, 'projectClientAssign', {
      value: [
        { projectName: 'Test Project', shortName: 'TP', abrufRequired: true },
        { projectName: 'Another Project', shortName: 'AP', abrufRequired: true },
      ]
    });

    // Spy on the protected method
    spyOn<any>(component, 'filterClientProjects').and.callThrough();

    // Set the filter value
    component.projectFilterCtrl.setValue('Test');

    // Call the protected method
    (component as any).filterClientProjects();

    // Verify the results
    component.allProjectClients.subscribe((filteredClients: any[]) => {
      expect(filteredClients.length).toBe(1);
      expect(filteredClients[0].projectName).toBe('Test Project');
    });
  });
});
