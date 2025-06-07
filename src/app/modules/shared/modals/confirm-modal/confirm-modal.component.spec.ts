import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';


describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmModalComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [ { provide: MatDialogRef, useValue: {} }, { provide: MAT_DIALOG_DATA, useValue: {  } } ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    // Mock the MatDialogRef
    const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    component.dialogRef = dialogRefMock;

    // Trigger the closeDialog method
    component.closeDialog(true);

    // Assert that the close method of MatDialogRef is called
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
