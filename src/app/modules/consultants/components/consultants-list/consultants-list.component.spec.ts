import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ConsultantsListComponent } from './consultants-list.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConsultantService } from '../../../shared/services/consultant/consultant.service';
import { PoService } from '../../../shared/services/po/po.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Messages } from '../../../../models/message-enum';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';
import { CreateConsultantsComponent } from '../create-consultants/create-consultants.component';

describe('ConsultantsListComponent', () => {
  let component: ConsultantsListComponent;
  let fixture: ComponentFixture<ConsultantsListComponent>;
  let consultantService: jasmine.SpyObj<ConsultantService>;
  let poService: jasmine.SpyObj<PoService>;
  let toastrService: jasmine.SpyObj<ToastrService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async () => {
    const consultantServiceSpy = jasmine.createSpyObj('ConsultantService', [
      'getAllConsultants',
      'getConsultantById',
      'deleteConsultant',
    ]);
    const poServiceSpy = jasmine.createSpyObj('PoService', ['checkConsultantDelete']);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success', 'warning']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);

    await TestBed.configureTestingModule({
      declarations: [ConsultantsListComponent],
      imports: [HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConsultantService, useValue: consultantServiceSpy },
        { provide: PoService, useValue: poServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultantsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    consultantService = TestBed.inject(ConsultantService) as jasmine.SpyObj<ConsultantService>;
    poService = TestBed.inject(PoService) as jasmine.SpyObj<PoService>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<any>>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // describe('#getAllConsultantList', () => {
  //   it('should load all consultants successfully', fakeAsync(() => {
  //     const mockConsultants = [{ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', status: 'Active' }];
  //     consultantService.getAllConsultants.and.returnValue(of({ status: 200, body: mockConsultants }) as any);

  //     component.getAllConsultantList();
  //     tick();

  //     expect(component.isLoading).toBeFalse();
  //     expect(component.dataSource).toEqual(mockConsultants);
  //     expect(consultantService.getAllConsultants).toHaveBeenCalled();
  //   }));

  //   it('should handle error on loading consultants', fakeAsync(() => {
  //     const errorResponse = new HttpErrorResponse({ error: 'error', status: 500 });
  //     consultantService.getAllConsultants.and.returnValue(throwError(() => errorResponse));

  //     component.getAllConsultantList();
  //     tick();

  //     expect(component.isLoading).toBeFalse();
  //     expect(component.dataSource).toEqual([]);
  //     expect(consultantService.getAllConsultants).toHaveBeenCalled();
  //   }));
  // });

  // describe('#createConsultants', () => {
  //   it('should open create consultant dialog', fakeAsync(() => {
  //     dialog.open.and.returnValue(dialogRef);
  //     dialogRef.afterClosed.and.returnValue(of(true));

  //     component.createConsultants();
  //     tick();

  //     expect(dialog.open).toHaveBeenCalledWith(CreateConsultantsComponent, {
  //       panelClass: 'create-modal',
  //       width: '700px',
  //       height: '400px',
  //       disableClose: true,
  //     });
  //     expect(dialogRef.afterClosed).toHaveBeenCalled();
  //     expect(consultantService.getAllConsultants).toHaveBeenCalled();
  //   }));
  // });

  // describe('#editConsultant', () => {
  //   it('should load consultant by id and open edit dialog', fakeAsync(() => {
  //     const mockConsultant = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', status: 'Active' };
  //     consultantService.getConsultantById.and.returnValue(of({ status: 200, body: mockConsultant }) as any);
  //     dialog.open.and.returnValue(dialogRef);
  //     dialogRef.afterClosed.and.returnValue(of(true));

  //     component.editConsultant('123');
  //     tick();

  //     expect(consultantService.getConsultantById).toHaveBeenCalledWith('123');
  //     expect(dialog.open).toHaveBeenCalledWith(CreateConsultantsComponent, {
  //       panelClass: 'create-modal',
  //       width: '700px',
  //       height: '400px',
  //       disableClose: true,
  //       data: mockConsultant,
  //     });
  //     expect(dialogRef.afterClosed).toHaveBeenCalled();
  //     expect(consultantService.getAllConsultants).toHaveBeenCalled();
  //   }));

  //   it('should handle error on loading consultant by id', fakeAsync(() => {
  //     const errorResponse = new HttpErrorResponse({ error: 'error', status: 500 });
  //     consultantService.getConsultantById.and.returnValue(throwError(() => errorResponse));

  //     component.editConsultant('123');
  //     tick();

  //     expect(consultantService.getConsultantById).toHaveBeenCalledWith('123');
  //     expect(dialog.open).not.toHaveBeenCalled();
  //   }));
  // });

  // describe('#deleteConsultant', () => {
  //   it('should delete consultant when checkConsultantDelete returns false', fakeAsync(() => {
  //     poService.checkConsultantDelete.and.returnValue(of(false) as any);
  //     dialog.open.and.returnValue(dialogRef);
  //     dialogRef.afterClosed.and.returnValue(of(true));
  //     consultantService.deleteConsultant.and.returnValue(of({ status: 200 }) as any);

  //     component.deleteConsultant({ firstName: 'John', lastName: 'Doe' }, '123');
  //     tick();

  //     expect(poService.checkConsultantDelete).toHaveBeenCalledWith('123');
  //     expect(dialog.open).toHaveBeenCalledWith(ConfirmModalComponent, {
  //       panelClass: 'delete-modal',
  //       width: '445px',
  //       height: '220px',
  //       disableClose: true,
  //       data: [Messages.deleteConsultant, Messages.deleteConsultantTitle],
  //     });
  //     expect(consultantService.deleteConsultant).toHaveBeenCalledWith('123');
  //     expect(toastrService.success).toHaveBeenCalledWith('Consultant deleted successfully');
  //   }));

  //   it('should open delete confirmation dialog when checkConsultantDelete returns true', fakeAsync(() => {
  //     poService.checkConsultantDelete.and.returnValue(of(true) as any);
  //     dialog.open.and.returnValue(dialogRef);
  //     dialogRef.afterClosed.and.returnValue(of(true));

  //     component.deleteConsultant({ firstName: 'John', lastName: 'Doe' }, '123');
  //     tick();

  //     expect(poService.checkConsultantDelete).toHaveBeenCalledWith('123');
  //     expect(dialog.open).toHaveBeenCalledWith(DeleteModalComponent, {
  //       panelClass: 'edit-modal',
  //       width: '590px',
  //       height: '270px',
  //       disableClose: true,
  //       data: ['Consultant', 'John Doe'],
  //     });
  //   }));

  //   it('should handle error on delete consultant', fakeAsync(() => {
  //     const errorResponse = new HttpErrorResponse({ error: 'error', status: 500 });
  //     poService.checkConsultantDelete.and.returnValue(of(false) as any);
  //     dialog.open.and.returnValue(dialogRef);
  //     dialogRef.afterClosed.and.returnValue(of(true));
  //     consultantService.deleteConsultant.and.returnValue(throwError(() => errorResponse));

  //     component.deleteConsultant({ firstName: 'John', lastName: 'Doe' }, '123');
  //     tick();

  //     expect(poService.checkConsultantDelete).toHaveBeenCalledWith('123');
  //     expect(dialog.open).toHaveBeenCalled();
  //     expect(consultantService.deleteConsultant).toHaveBeenCalledWith('123');
  //     expect(toastrService.success).not.toHaveBeenCalled();
  //   }));
  // });
});
