import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignClientToProjectComponent } from './assign-client-to-project.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('AssignClientToProjectComponent', () => {
  let component: AssignClientToProjectComponent;
  let fixture: ComponentFixture<AssignClientToProjectComponent>;
  const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['close','open']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignClientToProjectComponent],
      imports: [MatDialogModule, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefSpyObj
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignClientToProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add clients to the form array', () => {
    const clientsArray = [
      { id: '1', shortName: 'Client 1', legalName: '', status: 'Active' },
      { id: '2', shortName: 'Client 2', legalName: '',  status: 'Inactive' },
    ];

    component.addClientsToFormArray(clientsArray);

    expect(component.clients.length).toBe(2);
    expect(component.clients.at(0).value).toEqual({ client: { id: '1', shortName: 'Client 1', legalName: '', status: 'Active' } });
    expect(component.clients.at(1).value).toEqual({ client: { id: '2', shortName: 'Client 2', legalName: '', status: 'Inactive' } });
  });

  it('should compare clients', () => {
    // Arrange
    const client1 = { id: '1', name: 'Client 1' };
    const client2 = { id: '2', name: 'Client 2' };

    // Act
    const result1 = component.compareClients(client1, client2);
    const result2 = component.compareClients(client1, client1);
    const result3 = component.compareClients(client2, client1);

    // Assert
    expect(result1).toBe(false);
    expect(result2).toBe(true);
    expect(result3).toBe(false);
  });

  it('should close the dialog', () => {
    // Arrange
    const isAssigned = true;

    // Act
    component.closeDialog(isAssigned);

    // Assert
    expect(component.dialogRef.close).toHaveBeenCalledWith(isAssigned);
  });

  it('should remove client from the form array', () => {
    // Arrange
    const index = 0;
    // Act
    component.openDeleteConfirmationDialog(index, 'reason');
    // Assert
    expect(component.clients.length).toBe(0);
  });

  it('should add a client to the form array', () => {
    // Arrange
    const initialLength = component.clients.length;

    // Act
    component.addClient();

    // Assert
    expect(component.clients.length).toBe(initialLength);
  });

  it('should save client project', () => {
    // Arrange
    const isAssigned = true;
    spyOn((component as any).clientProjectService, 'assignClientToProject').and.returnValue(of({ status: 200 }));

    // Act
    component.saveClientProject();

    // Assert
    expect(component.isAssigning).toBe(true);
    expect(component.dialogRef.close).toHaveBeenCalledWith(isAssigned);
  });
});
