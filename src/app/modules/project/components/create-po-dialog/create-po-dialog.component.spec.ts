import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { CreatePoDialogComponent } from './create-po-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('CreatePoDialogComponent', () => {
  let component: CreatePoDialogComponent;
  let fixture: ComponentFixture<CreatePoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePoDialogComponent],
      imports: [MatDialogModule, ToastrModule.forRoot(), HttpClientModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


it('should add a PG to a PO', () => {

  component.createPOForm.controls.pgWithRemoteAndOnsite.setValue(true);
  let pgGroup = component.createPgFormGroup();
  pgGroup.controls.pgName.setValue('Test PG');
  pgGroup.controls.totalOnsiteHours.setValue("10");
  pgGroup.controls.onsiteRate.setValue("20");
  pgGroup.controls.totalRemoteHours.setValue("5");
  pgGroup.controls.remoteRate.setValue("15");
  component.pgFormArray.push(pgGroup);


  pgGroup.controls.pgName.updateValueAndValidity();
  pgGroup.controls.totalOnsiteHours.updateValueAndValidity();
  pgGroup.controls.onsiteRate.updateValueAndValidity();
  pgGroup.controls.totalRemoteHours.updateValueAndValidity();
  pgGroup.controls.remoteRate.updateValueAndValidity();


  expect(component.pgFormArray.length).toBeGreaterThan(0);
  expect(pgGroup.controls.pgName.value).toBe('Test PG');
  expect(Number(pgGroup.controls.totalOnsiteBudget.value)).toBe(200);
  expect(Number(pgGroup.controls.totalRemoteBudget.value)).toBe(75);
});



it('should disable remote when checkbox is unchecked', () => {

  component.createPOForm.controls.pgWithRemoteAndOnsite.setValue(true);
  let pgGroup = component.createPgFormGroup();
  pgGroup.controls.pgName.setValue('Test PG');
  pgGroup.controls.totalOnsiteHours.setValue("10");
  pgGroup.controls.onsiteRate.setValue("20");
  pgGroup.controls.totalRemoteHours.setValue("5");
  pgGroup.controls.remoteRate.setValue("15");
  component.pgFormArray.push(pgGroup);


  component.createPOForm.controls.pgWithRemoteAndOnsite.setValue(false);


  pgGroup.controls.pgName.updateValueAndValidity();
  pgGroup.controls.totalOnsiteHours.updateValueAndValidity();
  pgGroup.controls.onsiteRate.updateValueAndValidity();
  pgGroup.controls.totalRemoteHours.updateValueAndValidity();
  pgGroup.controls.remoteRate.updateValueAndValidity();


  expect(Number(pgGroup.controls.totalRemoteHours.value)).toBe(5);
  expect(Number(pgGroup.controls.remoteRate.value)).toBe(15);
  expect(Number(pgGroup.controls.totalRemoteBudget.value)).toBe(75);
  expect(pgGroup.controls.totalRemoteDays.value).toBe('0,625');
  expect(isNaN(Number(pgGroup.controls.totalRemoteDays.value))).toBe(true);
});



it('should validate PG Name uniqueness', () => {

  let pgGroup = component.createPgFormGroup();
  pgGroup.controls.pgName.setValue('Test PG');
  component.pgFormArray.push(pgGroup);

  let duplicatePgGroup = component.createPgFormGroup();
  duplicatePgGroup.controls.pgName.setValue('Test PG');
  component.pgFormArray.push(duplicatePgGroup);


  duplicatePgGroup.controls.pgName.updateValueAndValidity();


  expect(duplicatePgGroup.controls.pgName.hasError('duplicate')).toBe(true);
});

it('should update PO Number', () => {
  component.createPOForm.controls.poNo.setValue('SB-MSDUK-PO-2');
  expect(component.createPOForm.controls.poNo.value).toBe('SB-MSDUK-PO-2');
});

it('should update PO Start Date', () => {
  component.createPOForm.controls.poStartDate.setValue('2024-08-01');
  expect(component.createPOForm.controls.poStartDate.value).toBe('2024-08-01');
});

it('should update PO End Date', () => {
  component.createPOForm.controls.poEndDate.setValue('2024-09-01');
  expect(component.createPOForm.controls.poEndDate.value).toBe('2024-09-01');
});

it('should update PO Amount', () => {
  component.createPOForm.controls.poTotalBudget.setValue('0');
  expect(component.createPOForm.controls.poTotalBudget.value).toBe('0');
});

it('should update Currency', () => {
  component.createPOForm.controls.currency.setValue('USD');
  expect(component.createPOForm.controls.currency.value).toBe('USD');
});

it('should update Notes', () => {
  component.createPOForm.controls.notes.setValue('Updated notes for the PO');
  expect(component.createPOForm.controls.notes.value).toBe('Updated notes for the PO');
});

it('should update PG with Remote and Onsite', () => {
  component.createPOForm.controls.pgWithRemoteAndOnsite.setValue(true);
  expect(component.createPOForm.controls.pgWithRemoteAndOnsite.value).toBe(true);
});

it('should update PG Details', () => {
  let pgGroup = component.createPgFormGroup();
  pgGroup.controls.pgName.setValue('New PG Name');
  pgGroup.controls.totalOnsiteHours.setValue('20');
  pgGroup.controls.onsiteRate.setValue('30');
  pgGroup.controls.totalOnsiteBudget.setValue('600');
  pgGroup.controls.totalRemoteHours.setValue('15');
  pgGroup.controls.remoteRate.setValue('25');
  pgGroup.controls.totalRemoteBudget.setValue('375');
  component.pgFormArray.push(pgGroup);

  expect(pgGroup.controls.pgName.value).toBe('New PG Name');
  expect(pgGroup.controls.totalOnsiteHours.value).toBe('20');
  expect(pgGroup.controls.onsiteRate.value).toBe('30');
  expect(pgGroup.controls.totalOnsiteBudget.value).toBe('600');
  expect(pgGroup.controls.totalRemoteHours.value).toBe('15');
  expect(pgGroup.controls.remoteRate.value).toBe('25');
  expect(pgGroup.controls.totalRemoteBudget.value).toBe('375');
});

});
